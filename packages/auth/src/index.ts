import "dotenv/config";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import prisma from "@studio233/db";
import { getPolarClient } from "./lib/payments";
import { CreditLedgerService } from "./services/credit-ledger-service";
import { SubscriptionService } from "./services/subscription-service";
import { UserOnboardingService } from "./services/user-onboarding-service";
import { UsageService } from "./services/usage-service";
import { PolarWebhookHandler } from "./webhooks/polar-webhook-handler";

const creditLedgerService = new CreditLedgerService();
const subscriptionService = new SubscriptionService(creditLedgerService);
const userOnboardingService = new UserOnboardingService(creditLedgerService);
const usageService = new UsageService(creditLedgerService, subscriptionService);
const polarWebhookHandler = new PolarWebhookHandler(subscriptionService);
const polarClient = getPolarClient();
const authPlugins = polarClient
	? [
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			enableCustomerPortal: true,
			use: [
				checkout({
					products: [
						{
							productId: process.env.POLAR_PRODUCT_ID || "your-product-id",
							slug: "pro",
						},
					],
					successUrl: process.env.POLAR_SUCCESS_URL,
					authenticatedUsersOnly: true,
				}),
				portal(),
			],
		}),
	]
	: [];

export const auth = betterAuth<BetterAuthOptions>({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    trustedOrigins: [process.env.CORS_ORIGIN || ''],
    emailAndPassword: {
        enabled: true,
    },
	plugins: authPlugins,
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await userOnboardingService.ensureDefaults({ id: user.id as string });
				},
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
export {
	usageService,
	subscriptionService,
	creditLedgerService,
	polarWebhookHandler,
};
export type { PolarSubscriptionEvent } from "./webhooks/polar-webhook-handler";
