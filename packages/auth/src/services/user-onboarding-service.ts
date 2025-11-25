import { prisma } from "@studio233/db";
import { billingConfig } from "../config/billing";
import { CreditLedgerService } from "./credit-ledger-service";
import { DuplicateLedgerEntryError } from "./errors";

export class UserOnboardingService {
	constructor(private readonly ledger: CreditLedgerService) {}

	async ensureDefaults(user: { id: string }) {
		await prisma.userSetting.upsert({
			where: { userId: user.id },
			create: { userId: user.id },
			update: {},
		});
		await this.grantWelcomeCredits(user.id);
	}

	private async grantWelcomeCredits(userId: string) {
		const reference = `welcome:${userId}`;
		try {
			await this.ledger.grantCredits({
				userId,
				amount: billingConfig.welcomeCredits,
				reference,
				description: "Welcome credits",
			});
		} catch (error) {
			if (!(error instanceof DuplicateLedgerEntryError)) {
				throw error;
			}
		}
	}
}
