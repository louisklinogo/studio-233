import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import type { SubscriptionStatus as PolarSubscriptionStatus } from "@polar-sh/sdk/models/components/subscriptionstatus";
import {
	CreditEntryType,
	SubscriptionStatus as DbSubscriptionStatus,
	Prisma,
	prisma,
} from "@studio233/db";
import { billingConfig } from "../config/billing";
import { CreditLedgerService } from "./credit-ledger-service";
import { MissingUserReferenceError } from "./errors";

const statusMap: Record<PolarSubscriptionStatus, DbSubscriptionStatus> = {
	incomplete: DbSubscriptionStatus.INCOMPLETE,
	incomplete_expired: DbSubscriptionStatus.INCOMPLETE,
	trialing: DbSubscriptionStatus.TRIALING,
	active: DbSubscriptionStatus.ACTIVE,
	past_due: DbSubscriptionStatus.PAST_DUE,
	canceled: DbSubscriptionStatus.CANCELED,
	unpaid: DbSubscriptionStatus.PAST_DUE,
};

type SyncContext = {
	eventType: string;
};

export class SubscriptionService {
	constructor(private readonly ledger: CreditLedgerService) {}

	async syncFromPolar(subscription: Subscription, context: SyncContext) {
		const userId = subscription.customer.externalId;
		if (!userId) {
			throw new MissingUserReferenceError();
		}
		const status = statusMap[subscription.status];
		const metadataSlug =
			subscription.product.metadata?.["planSlug"] ??
			subscription.product.metadata?.["slug"];
		const planSlug =
			typeof metadataSlug === "string" ? metadataSlug : undefined;
		const data: Prisma.SubscriptionUncheckedCreateInput = {
			userId,
			provider: "polar",
			externalId: subscription.id,
			productId: subscription.productId,
			planSlug,
			status,
			currentPeriodEnd: subscription.currentPeriodEnd ?? undefined,
			cancelAt: subscription.cancelAtPeriodEnd
				? (subscription.currentPeriodEnd ?? undefined)
				: undefined,
			canceledAt: subscription.canceledAt ?? undefined,
			meta: {
				currency: subscription.currency,
				amount: subscription.amount,
				planSlug,
				eventType: context.eventType,
			},
		};

		await prisma.subscription.upsert({
			where: {
				provider_externalId: {
					provider: "polar",
					externalId: subscription.id,
				},
			},
			create: data,
			update: data,
		});

		if (this.shouldGrantCredits(status)) {
			await this.grantPlanCredits(userId, subscription, planSlug);
		}
	}

	async getActiveSubscription(userId: string) {
		return prisma.subscription.findFirst({
			where: {
				userId,
				status: {
					in: [DbSubscriptionStatus.ACTIVE, DbSubscriptionStatus.TRIALING],
				},
			},
			orderBy: { updatedAt: "desc" },
		});
	}

	private shouldGrantCredits(status: DbSubscriptionStatus) {
		return (
			status === DbSubscriptionStatus.ACTIVE ||
			status === DbSubscriptionStatus.TRIALING
		);
	}

	private async grantPlanCredits(
		userId: string,
		subscription: Subscription,
		planSlug?: string,
	) {
		const amount = billingConfig.getPlanCredits(planSlug);
		if (amount <= 0 || !subscription.currentPeriodStart) {
			return;
		}
		const reference = `polar:${subscription.id}:${subscription.currentPeriodStart.toISOString()}`;
		await this.ledger.grantCredits({
			userId,
			amount,
			entryType: CreditEntryType.GRANT,
			reference,
			description: `Plan renewal (${planSlug ?? "default"})`,
			metadata: {
				subscriptionId: subscription.id,
				planSlug,
				periodStart: subscription.currentPeriodStart.toISOString(),
			},
		});
	}
}
