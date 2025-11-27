"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { SwissIcons } from "../ui/SwissIcons";
import { FederatedLoginButton } from "./FederatedLoginButton";
import { LoginFormReceipt } from "./variants/LoginFormReceipt";
import { LoginFormSignal } from "./variants/LoginFormSignal";

type Variant = "signal" | "receipt";

export function LoginForm() {
	const [mode, setMode] = useState<"federated" | "email">("federated");
	const [variant, setVariant] = useState<Variant>("signal");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (session) {
			router.push("/dashboard");
		}
	}, [session, router]);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
				fetchOptions: {
					onSuccess: () => {
						toast.success("FEDERATION PROTOCOL ESTABLISHED");
					},
					onError: (ctx) => {
						toast.error(ctx.error.message || "FEDERATION FAILED");
					},
				},
			});
		} catch (error) {
			console.error(error);
			toast.error("CONNECTION ERROR");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full justify-between">
			<div className="space-y-6">
				{/* Primary Navigation */}
				<div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-800 mb-4">
					<div className="flex flex-1">
						<button
							onClick={() => setMode("federated")}
							className={`flex-1 pb-2 font-mono text-xs transition-colors relative ${
								mode === "federated"
									? "text-[#FF4D00]"
									: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
							}`}
						>
							FEDERATED_AUTH
							{mode === "federated" && (
								<motion.div
									layoutId="activeTab"
									className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4D00]"
								/>
							)}
						</button>
						<button
							onClick={() => setMode("email")}
							className={`flex-1 pb-2 font-mono text-xs transition-colors relative ${
								mode === "email"
									? "text-[#FF4D00]"
									: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
							}`}
						>
							EMAIL_ACCESS
							{mode === "email" && (
								<motion.div
									layoutId="activeTab"
									className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4D00]"
								/>
							)}
						</button>
					</div>
				</div>

				{/* Secondary Interface Mode Toggle (Only visible in Email Mode) */}
				<AnimatePresence>
					{mode === "email" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="flex justify-end"
						>
							<div className="inline-flex bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-none border border-neutral-200 dark:border-neutral-800">
								<button
									onClick={() => setVariant("signal")}
									className={`relative px-3 py-1 font-mono text-[9px] transition-colors ${
										variant === "signal"
											? "text-[#FF4D00]"
											: "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
									}`}
								>
									SIGNAL
									{variant === "signal" && (
										<motion.div
											layoutId="variantHighlight"
											className="absolute inset-0 bg-white dark:bg-black shadow-sm border border-neutral-200 dark:border-neutral-800 -z-10"
										/>
									)}
								</button>
								<button
									onClick={() => setVariant("receipt")}
									className={`relative px-3 py-1 font-mono text-[9px] transition-colors ${
										variant === "receipt"
											? "text-[#FF4D00]"
											: "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
									}`}
								>
									RECEIPT
									{variant === "receipt" && (
										<motion.div
											layoutId="variantHighlight"
											className="absolute inset-0 bg-white dark:bg-black shadow-sm border border-neutral-200 dark:border-neutral-800 -z-10"
										/>
									)}
								</button>
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
							className="py-4 space-y-4"
						>
							<div className="text-center mb-6">
								<p className="font-mono text-[10px] text-neutral-500">
									SELECT IDENTITY PROVIDER
								</p>
							</div>

							<FederatedLoginButton
								provider="google"
								onClick={handleGoogleLogin}
								isLoading={isLoading}
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
			<div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
				<div className="flex justify-between items-center font-mono text-[9px] text-neutral-400">
					<span>SECURE_CHANNEL: TLS_1.3</span>
					<span className="flex items-center gap-1">
						STATUS:
						<span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
						ACTIVE
					</span>
				</div>
			</div>
		</div>
	);
}
