"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { type AuthFetchContext, authClient } from "@/lib/auth-client";
import { SwissIcons } from "../ui/SwissIcons";
import { BraunHandshakeSwitch } from "./BraunHandshakeSwitch";
import { FederatedLoginButton } from "./FederatedLoginButton";
import { LoginFormReceipt } from "./variants/LoginFormReceipt";

export function LoginForm() {
	const [mode, setMode] = useState<"federated" | "email">("federated");
	const [isLoading, setIsLoading] = useState(false);
	const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const isAuthenticated = Boolean(session);

	useEffect(() => {
		if (isAuthenticated) {
			router.push("/dashboard");
		}
	}, [isAuthenticated, router]);

	const handleGoogleLogin = async () => {
		if (isAuthenticated) {
			toast.message("Already authenticated. Redirecting to dashboard.");
			router.push("/dashboard");
			return;
		}
		setIsLoading(true);
		try {
			await authClient.signIn.social(
				{
					provider: "google",
					callbackURL: "/dashboard",
				},
				{
					onSuccess: () => {
						toast.success("FEDERATION PROTOCOL ESTABLISHED");
					},
					onError: ({ error }: AuthFetchContext) => {
						toast.error(error.message || "FEDERATION FAILED");
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error("CONNECTION ERROR");
		} finally {
			setIsLoading(false);
		}
	};

	const handleContinue = () => {
		router.push("/dashboard");
	};

	const handleSwitchAccount = async () => {
		setIsSwitchingAccount(true);
		try {
			await authClient.signOut();
			toast.success("Signed out. Choose another account.");
			router.refresh();
		} catch (error) {
			console.error(error);
			toast.error("Failed to sign out");
		} finally {
			setIsSwitchingAccount(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full justify-between">
			<div className="space-y-8">
				{isAuthenticated && (
					<div className="bg-[#0a0a0a] border border-[#222] p-5 relative overflow-hidden group/session">
						{/* Subtle background glow */}
						<div className="absolute inset-0 bg-emerald-500/5 opacity-40" />

						<div className="relative z-10 space-y-4">
							<div className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-emerald-500/80">
								<div className="relative w-2 h-2">
									<span className="animate-ping absolute inset-0 rounded-full bg-emerald-500 opacity-20" />
									<span className="relative block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
								</div>
								<span>SECURE_DATA_LINK — ACTIVE</span>
							</div>

							<div className="flex flex-wrap gap-3 pt-1">
								<button
									onClick={handleContinue}
									className="px-5 py-2 text-xs uppercase font-mono bg-[#1a1a1a] text-white border-t border-l border-[#333] border-b border-r border-black hover:bg-black transition-all shadow-md group-hover/session:border-emerald-500/30"
								>
									Open Terminal
								</button>
								<button
									onClick={handleSwitchAccount}
									disabled={isSwitchingAccount}
									className="px-5 py-2 text-xs uppercase font-mono text-neutral-600 hover:text-neutral-400 transition-colors disabled:opacity-50"
								>
									{isSwitchingAccount ? "Terminating..." : "Drop Session"}
								</button>
							</div>
						</div>
					</div>
				)}

				<BraunHandshakeSwitch mode={mode} onChange={setMode} />

				<div className="pt-4">
					<AnimatePresence mode="wait">
						{mode === "federated" ? (
							<motion.div
								key="federated"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="py-4 space-y-6"
							>
								<div className="flex items-center gap-4 text-muted-foreground">
									<div className="h-px flex-1 bg-border" />
									<p className="font-mono text-[10px] uppercase tracking-widest">
										Select Identity Provider
									</p>
									<div className="h-px flex-1 bg-border" />
								</div>

								<FederatedLoginButton
									provider="google"
									onClick={handleGoogleLogin}
									isLoading={isLoading || isSwitchingAccount || isAuthenticated}
								/>
							</motion.div>
						) : (
							<motion.div
								key="email"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="py-0"
							>
								<LoginFormReceipt />
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Footer Status */}
			<div className="pt-6 mt-8 border-t border-[#1a1a1a]">
				<div className="flex justify-between items-center font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
					<div className="flex items-center gap-2">
						<SwissIcons.Lock size={10} className="text-neutral-700" />
						<span>AUTH_GATEWAY // PHOENIX-RELAY</span>
					</div>
					<span className="flex items-center gap-2">
						<span className="text-neutral-700">STATUS.</span>
						<span className="w-1 h-1 rounded-full bg-[#FF4D00] shadow-[0_0_8px_rgba(255,77,0,0.8)]" />
					</span>
				</div>
			</div>
		</div>
	);
}
