"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { BiometricScanner } from "./BiometricScanner";

export function LoginForm() {
	const [mode, setMode] = useState<"biometric" | "terminal">("biometric");
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handlePasskeyLogin = async () => {
		setIsLoading(true);
		try {
			await authClient.signIn.passkey({
				fetchOptions: {
					onSuccess: () => {
						toast.success("ACCESS GRANTED");
						router.push("/dashboard");
					},
					onError: (ctx) => {
						toast.error(ctx.error.message || "BIOMETRIC SCAN FAILED");
					},
				},
			});
		} catch (error) {
			console.error(error);
			toast.error("HARDWARE ERROR DETECTED");
		} finally {
			setIsLoading(false);
		}
	};

	const handleMagicLink = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await authClient.signIn.magicLink({
				email,
				callbackURL: "/dashboard",
				fetchOptions: {
					onSuccess: () => {
						toast.success("ENCRYPTED PACKET SENT. CHECK INBOX.");
					},
					onError: (ctx) => {
						toast.error(ctx.error.message || "TRANSMISSION FAILED");
					},
				},
			});
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAnonymousLogin = async () => {
		setIsLoading(true);
		try {
			await authClient.signIn.anonymous({
				fetchOptions: {
					onSuccess: () => {
						toast.success("GUEST ACCESS GRANTED");
						router.push("/dashboard");
					},
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
				},
			});
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full justify-between">
			<div className="space-y-6">
				{/* Mode Tabs */}
				<div className="flex border-b border-neutral-200 dark:border-neutral-800">
					<button
						onClick={() => setMode("biometric")}
						className={`flex-1 pb-2 font-mono text-xs transition-colors relative ${
							mode === "biometric"
								? "text-emerald-500"
								: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
						}`}
					>
						HARDWARE_KEY
						{mode === "biometric" && (
							<motion.div
								layoutId="activeTab"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
							/>
						)}
					</button>
					<button
						onClick={() => setMode("terminal")}
						className={`flex-1 pb-2 font-mono text-xs transition-colors relative ${
							mode === "terminal"
								? "text-emerald-500"
								: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
						}`}
					>
						TERMINAL_INPUT
						{mode === "terminal" && (
							<motion.div
								layoutId="activeTab"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
							/>
						)}
					</button>
				</div>

				<AnimatePresence mode="wait">
					{mode === "biometric" ? (
						<motion.div
							key="biometric"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="py-4"
						>
							<BiometricScanner
								onScan={handlePasskeyLogin}
								isScanning={isLoading}
							/>

							<div className="mt-8 text-center">
								<button
									onClick={handleAnonymousLogin}
									className="text-[10px] font-mono text-neutral-500 hover:text-emerald-500 underline decoration-dotted underline-offset-4 transition-colors"
								>
									[ ENTER_AS_GUEST_OPERATIVE ]
								</button>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="terminal"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="py-8 space-y-4"
						>
							<form onSubmit={handleMagicLink} className="space-y-4">
								<div className="space-y-2">
									<label className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block">
										Operator_ID (Email)
									</label>
									<div className="relative">
										<input
											type="email"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-3 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors text-neutral-900 dark:text-neutral-100"
											placeholder="OPERATIVE@STUDIO233.AI"
										/>
										<Mail className="absolute right-3 top-3 w-4 h-4 text-neutral-400" />
									</div>
								</div>

								<button
									type="submit"
									disabled={isLoading}
									className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-mono text-xs font-bold py-3 px-4 flex items-center justify-between hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
								>
									{isLoading ? (
										<span>TRANSMITTING...</span>
									) : (
										<span>SEND_VERIFICATION_PACKET</span>
									)}
									{isLoading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
									)}
								</button>
							</form>
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
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
						ACTIVE
					</span>
				</div>
			</div>
		</div>
	);
}
