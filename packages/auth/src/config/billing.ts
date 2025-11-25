const parsePlanCredits = (value: string | undefined) => {
	const normalized = value?.trim();
	if (!normalized) {
		return new Map<string, number>();
	}
	return normalized.split(",").reduce((map, entry) => {
		const [slug, amount] = entry.split(":");
		const trimmedSlug = slug?.trim();
		const parsedAmount = Number.parseInt(amount?.trim() ?? "", 10);
		if (trimmedSlug && Number.isFinite(parsedAmount)) {
			map.set(trimmedSlug, parsedAmount);
		}
		return map;
	}, new Map<string, number>());
};

const planCreditMap = parsePlanCredits(process.env.BILLING_PLAN_CREDITS);

const coerceNumber = (value: string | undefined, fallback: number) => {
	const parsed = Number.parseInt(value ?? "", 10);
	return Number.isFinite(parsed) ? parsed : fallback;
};

export const billingConfig = {
	welcomeCredits: coerceNumber(process.env.BILLING_WELCOME_CREDITS, 25),
	planCreditMap,
	defaultPlanCredits: coerceNumber(process.env.BILLING_DEFAULT_PLAN_CREDITS, 250),
	batchCreditCostPerImage: coerceNumber(process.env.BATCH_CREDIT_COST_PER_IMAGE, 1),
	getPlanCredits(planSlug?: string | null) {
		if (planSlug && planCreditMap.has(planSlug)) {
			return planCreditMap.get(planSlug) ?? this.defaultPlanCredits;
		}
		return this.defaultPlanCredits;
	},
};

export type BillingConfig = typeof billingConfig;
