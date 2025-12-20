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
	const ToggleVariant = ({
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
			className={`relative px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-all duration-300 ${
				active
					? "bg-[#1a1a1a] text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)] border-t border-l border-white/5 border-b border-black"
					: "text-neutral-600 hover:text-neutral-400"
			}`}
		>
			{active && (
				<div className="absolute top-0 left-0 w-full h-[1px] bg-[#FF4D00]/50" />
			)}
			<span className="relative z-10">{label}</span>
		</button>
	);

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
			className="flex flex-col gap-2 group cursor-pointer relative"
		>
			{/* Track Markings */}
			{active && (
				<div className="absolute -left-1 -right-1 top-0 h-1 flex justify-between px-0.5 pointer-events-none opacity-40">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="w-[1px] h-full bg-[#FF4D00]/40" />
					))}
				</div>
			)}
			<div
				className={`h-1 w-8 transition-colors duration-300 relative ${active ? "bg-[#FF4D00] shadow-[0_0_8px_rgba(255,77,0,0.3)]" : "bg-[#1a1a1a] group-hover:bg-[#222]"}`}
			/>
			<span
				className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${active ? "text-foreground" : "text-neutral-600 group-hover:text-neutral-400"}`}
			>
				{label}
			</span>
		</button>
	);

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

				{/* Mode Selection (Industrial Toggles) */}
				<div className="flex items-start gap-8 border-b border-border pb-6 mb-8">
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
							<div className="flex bg-[#050505] p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-[#1a1a1a]">
								<ToggleVariant
									active={variant === "signal"}
									onClick={() => setVariant("signal")}
									label="Signal"
								/>
								<ToggleVariant
									active={variant === "receipt"}
									onClick={() => setVariant("receipt")}
									label="Receipt"
								/>
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
							{variant === "signal" && <LoginFormSignal />}
							{variant === "receipt" && <LoginFormReceipt />}
						</motion.div>
					)}
				</AnimatePresence>
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
