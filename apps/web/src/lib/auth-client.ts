import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export type AuthFetchContext = {
	error: {
		message?: string;
	};
};

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001",
	plugins: [emailOTPClient()],
});
