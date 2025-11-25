import type { Prisma } from "@studio233/db";
import { billingConfig } from "../config/billing";
import { CreditLedgerService } from "./credit-ledger-service";
import { SubscriptionService } from "./subscription-service";

type UsageContext = {
	description?: string;
	reference?: string;
	metadata?: Prisma.InputJsonValue;
};

export class UsageService {
	constructor(
		private readonly ledger: CreditLedgerService,
		private readonly subscriptions: SubscriptionService,
	) {}

	async getBalance(userId: string) {
		return this.ledger.getBalance(userId);
	}

	async getActiveSubscription(userId: string) {
		return this.subscriptions.getActiveSubscription(userId);
	}

	async consumeForBatch(userId: string, units: number, ctx: UsageContext = {}) {
		const amount = units * billingConfig.batchCreditCostPerImage;
		await this.ledger.consumeCredits({
			userId,
			amount,
			reference: ctx.reference,
			description: ctx.description ?? `Batch usage (${units} units)`,
			metadata: ctx.metadata,
		});
		return amount;
	}

	async refund(userId: string, amount: number, ctx: UsageContext = {}) {
		await this.ledger.refundCredits({
			userId,
			amount,
			reference: ctx.reference,
			description: ctx.description ?? "Usage refund",
			metadata: ctx.metadata,
		});
	}
}
