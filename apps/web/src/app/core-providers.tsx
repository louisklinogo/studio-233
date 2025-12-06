"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createTRPCClient,
	httpBatchLink,
	httpSubscriptionLink,
	splitLink,
} from "@trpc/client";
import { FiberProvider } from "its-fine";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import superjson from "superjson";
import { Toaster } from "@/components/ui/toaster";
import { makeQueryClient } from "@/lib/query-client";
import { AppRouter } from "@/server/trpc/routers/_app";
import { getUrl, TRPCProvider } from "@/trpc/client";

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	} else {
		if (!browserQueryClient) browserQueryClient = makeQueryClient();
		return browserQueryClient;
	}
}

export function CoreProviders({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient();

	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				splitLink({
					condition: (op) => op.type === "subscription",
					true: httpSubscriptionLink({
						transformer: superjson,
						url: getUrl(),
					}),
					false: httpBatchLink({
						transformer: superjson,
						url: getUrl(),
						headers() {
							return {
								"x-trpc-source": "client",
							};
						},
					}),
				}),
			],
		}),
	);

	return (
		<FiberProvider>
			<QueryClientProvider client={queryClient}>
				<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<Toaster />
					</ThemeProvider>
				</TRPCProvider>
			</QueryClientProvider>
		</FiberProvider>
	);
}
