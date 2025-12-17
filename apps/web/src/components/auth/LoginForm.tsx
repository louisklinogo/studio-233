"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { type AuthFetchContext, authClient } from "@/lib/auth-client";
import { SwissIcons } from "../ui/SwissIcons";
import { FederatedLoginButton } from "./FederatedLoginButton";
import { LoginFormReceipt } from "./variants/LoginFormReceipt";
import { LoginFormSignal } from "./variants/LoginFormSignal";

type Variant = "signal" | "receipt";

export function LoginForm() {
	const [mode, setMode] = useState<"federated" | "email">("federated");
	const [variant, setVariant] = useState<Variant>("signal");
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

	// Braun Industrial Toggle Component
	const ToggleSwitch = ({
		active,
		onClick,
		label,
	}: {
		active: boolean;
		onClick: () => void;
		label: string;
	}) => (
		<button
			onClick={onClick}
			className="flex flex-col gap-2 group cursor-pointer"
		>
			<div
				className={`h-1 w-8 transition-colors duration-300 ${active ? "bg-[#FF4D00]" : "bg-neutral-800 group-hover:bg-neutral-700"}`}
			/>
			<span
				className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${active ? "text-white" : "text-neutral-600 group-hover:text-neutral-400"}`}
			>
				{label}
			</span>
		</button>
	);

	return (
		<div className="flex-1 flex flex-col h-full justify-between">
			<div className="space-y-8">
				{isAuthenticated && (
					<div className="border border-emerald-900/30 bg-emerald-950/10 p-4 space-y-3">
						<div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-emerald-500">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
							CHANNEL SECURE — SESSION ACTIVE
						</div>
						<div className="flex flex-wrap gap-2">
							<button
								onClick={handleContinue}
								className="px-4 py-2 text-xs uppercase font-mono bg-emerald-500 text-black hover:bg-emerald-400 transition-colors font-bold"
							>
								Proceed to Console
							</button>
							<button
								onClick={handleSwitchAccount}
								disabled={isSwitchingAccount}
								className="px-4 py-2 text-xs uppercase font-mono border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors disabled:opacity-50"
							>
								{isSwitchingAccount ? "Terminating..." : "Switch Identity"}
							</button>
						</div>
					</div>
				)}

				{/* Mode Selection (Industrial Toggles) */}
				<div className="flex items-start gap-8 border-b border-neutral-900 pb-6 mb-8">
					<ToggleSwitch
						active={mode === "federated"}
						onClick={() => setMode("federated")}
						label="Federated_Auth"
					/>
					<ToggleSwitch
						active={mode === "email"}
						onClick={() => setMode("email")}
						label="Direct_Access"
					/>
				</div>

				{/* Secondary Interface Mode Toggle (Only visible in Email Mode) */}
				<AnimatePresence>
					{mode === "email" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="flex justify-end -mt-4 mb-4"
						>
							<div className="flex gap-1 bg-[#0f0f0f] p-1 border border-neutral-800">
								{["signal", "receipt"].map((v) => (
									<button
										key={v}
										onClick={() => setVariant(v as Variant)}
										className={`px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
											variant === v
												? "bg-[#222] text-white border border-neutral-700"
												: "text-neutral-600 hover:text-neutral-400"
										}`}
									>
										{v}
									</button>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence mode="wait">
					{mode === "federated" ? (
						<motion.div
							key="federated"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="py-4 space-y-6"
						>
							<div className="flex items-center gap-4 text-neutral-600">
								<div className="h-px flex-1 bg-neutral-900" />
								<p className="font-mono text-[10px] uppercase tracking-widest">
									Select Identity Provider
								</p>
								<div className="h-px flex-1 bg-neutral-900" />
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
							{variant === "signal" && <LoginFormSignal />}
							{variant === "receipt" && <LoginFormReceipt />}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Footer Status */}
			<div className="pt-6 mt-8 border-t border-neutral-900">
				<div className="flex justify-between items-center font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
					<div className="flex items-center gap-2">
						<SwissIcons.Lock size={10} />
						<span>TLS_1.3 /// ENCRYPTED</span>
					</div>
					<span className="flex items-center gap-2">
						GATEWAY_STATUS
						<span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
					</span>
				</div>
			</div>
		</div>
	);
}
