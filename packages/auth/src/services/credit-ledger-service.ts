import { prisma, CreditEntryType, Prisma } from "@studio233/db";
import { DuplicateLedgerEntryError, InsufficientCreditsError } from "./errors";

type LedgerEntryInput = {
	userId: string;
	amount: number;
	entryType?: CreditEntryType;
	description?: string;
	reference?: string;
	metadata?: Prisma.InputJsonValue;
};

export class CreditLedgerService {
	async getBalance(userId: string): Promise<number> {
		const latestEntry = await prisma.creditLedger.findFirst({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
		return latestEntry?.balanceAfter ?? 0;
	}

	async grantCredits(input: LedgerEntryInput): Promise<number> {
		return this.writeEntry({ ...input, entryType: input.entryType ?? CreditEntryType.GRANT });
	}

	async refundCredits(input: LedgerEntryInput): Promise<number> {
		return this.writeEntry({ ...input, entryType: CreditEntryType.REFUND });
	}

	async consumeCredits(input: LedgerEntryInput): Promise<number> {
		const amount = Math.abs(input.amount);
		return this.writeEntry({ ...input, amount: -amount, entryType: CreditEntryType.CONSUME });
	}

	private async writeEntry(input: LedgerEntryInput): Promise<number> {
		const { userId, amount, entryType, description, reference, metadata } = input;
		const metadataValue: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =
			metadata === undefined ? Prisma.JsonNull : metadata;
		return prisma.$transaction(async (tx) => {
			if (reference) {
				const existing = await tx.creditLedger.findFirst({ where: { reference } });
				if (existing) {
					throw new DuplicateLedgerEntryError();
				}
			}
			const latest = await tx.creditLedger.findFirst({
				where: { userId },
				orderBy: { createdAt: "desc" },
			});
			const nextBalance = (latest?.balanceAfter ?? 0) + amount;
			if (nextBalance < 0) {
				throw new InsufficientCreditsError();
			}
			await tx.creditLedger.create({
				data: {
					userId,
					amount,
					entryType: entryType ?? CreditEntryType.GRANT,
					description,
					reference,
					metadata: metadataValue,
					balanceAfter: nextBalance,
				},
			});
			return nextBalance;
		});
	}
}
