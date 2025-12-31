import "dotenv/config";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import prisma from "@studio233/db";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { getPolarClient } from "./lib/payments";
import { CreditLedgerService } from "./services/credit-ledger-service";
import { SubscriptionService } from "./services/subscription-service";
import { UsageService } from "./services/usage-service";
import { UserOnboardingService } from "./services/user-onboarding-service";
import { buildOtpEmailHtml } from "./templates/otp-email";
import { PolarWebhookHandler } from "./webhooks/polar-webhook-handler";

const creditLedgerService = new CreditLedgerService();
const subscriptionService = new SubscriptionService(creditLedgerService);
const userOnboardingService = new UserOnboardingService(creditLedgerService);
const usageService = new UsageService(creditLedgerService, subscriptionService);
const polarWebhookHandler = new PolarWebhookHandler(subscriptionService);
const polarClient = getPolarClient();
const resendClient = new Resend(process.env.RESEND_API_KEY);
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

const authOptions: BetterAuthOptions = {
	baseURL: process.env.BETTER_AUTH_URL,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || "", "http://localhost:3001"],
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
	},
	plugins: [
		...authPlugins,
		emailOTP({
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				if (!email || !otp) return;
				if (!process.env.RESEND_API_KEY) {
					console.error("RESEND_API_KEY missing; cannot send OTP email.");
					throw new Error("Internal server error: Email configuration missing");
				}
				const subjectPrefix =
					type === "sign-in"
						? "Studio+233 Access Code"
						: type === "email-verification"
							? "Studio+233 Email Verification"
							: "Studio+233 Security Code";
				const text =
					type === "sign-in"
						? `Your one-time access code is: ${otp}.\n\nIf you did not request this code, you can ignore this email.`
						: `Your verification code is: ${otp}.`;

				try {
					const { error } = await resendClient.emails.send({
						from:
							process.env.RESEND_FROM_EMAIL ||
							"Studio233 Auth <no-reply@studio233.ai>",
						to: email,
						subject: subjectPrefix,
						text,
						html: buildOtpEmailHtml({ otp, type }),
					});

					if (error) {
						console.error("Failed to send OTP email via Resend:", error);
						throw new Error("Failed to send verification email");
					}
				} catch (err) {
					console.error("Unexpected error sending OTP email:", err);
					throw err;
				}
			},
		}),
	],
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await userOnboardingService.ensureDefaults({ id: user.id as string });
				},
			},
		},
	},
};

const globalForAuth = globalThis as unknown as {
	auth: typeof auth | undefined;
};

export const auth = globalForAuth.auth ?? betterAuth(authOptions);

if (process.env.NODE_ENV !== "production") {
	globalForAuth.auth = auth;
}

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
export {
	usageService,
	subscriptionService,
	creditLedgerService,
	polarWebhookHandler,
};
export type { PolarSubscriptionEvent } from "./webhooks/polar-webhook-handler";
