import 'dotenv/config';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { polar, checkout, portal } from '@polar-sh/better-auth';
import { polarClient } from './lib/payments';
import prisma from '@studio233/db';

export const auth = betterAuth<BetterAuthOptions>({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    trustedOrigins: [process.env.CORS_ORIGIN || ''],
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            enableCustomerPortal: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: process.env.POLAR_PRODUCT_ID || 'your-product-id',
                            slug: 'pro',
                        },
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true,
                }),
                portal(),
            ],
        }),
    ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
