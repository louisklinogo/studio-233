"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { FederatedLoginButton } from "./FederatedLoginButton";

export function LoginForm() {
	const [mode, setMode] = useState<"federated" | "credentials">("federated");
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

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

	const handleCredentialsLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			if (isSignUp) {
				await authClient.signUp.email({
					email,
					password,
					name,
					callbackURL: "/dashboard",
					fetchOptions: {
						onSuccess: () => {
							toast.success("OPERATOR PROFILE CREATED");
							router.push("/dashboard");
						},
						onError: (ctx) => {
							toast.error(ctx.error.message || "REGISTRATION FAILED");
						},
					},
				});
			} else {
				await authClient.signIn.email({
					email,
					password,
					callbackURL: "/dashboard",
					fetchOptions: {
						onSuccess: () => {
							toast.success("ACCESS GRANTED");
							router.push("/dashboard");
						},
						onError: (ctx) => {
							toast.error(ctx.error.message || "INVALID CREDENTIALS");
						},
					},
				});
			}
		} catch (error) {
			console.error(error);
			toast.error("AUTHENTICATION ERROR");
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
						onClick={() => setMode("credentials")}
						className={`flex-1 pb-2 font-mono text-xs transition-colors relative ${
							mode === "credentials"
								? "text-[#FF4D00]"
								: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
						}`}
					>
						CREDENTIALS
						{mode === "credentials" && (
							<motion.div
								layoutId="activeTab"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4D00]"
							/>
						)}
					</button>
				</div>

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
							key="credentials"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="py-8 space-y-4"
						>
							<form onSubmit={handleCredentialsLogin} className="space-y-4">
								{isSignUp && (
									<div className="space-y-2">
										<label className="font-sans text-xs font-medium text-neutral-900 dark:text-neutral-100 block">
											Operator Name
										</label>
										<div className="relative">
											<input
												type="text"
												required
												value={name}
												onChange={(e) => setName(e.target.value)}
												className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-3 font-mono text-sm focus:outline-none focus:border-[#FF4D00] transition-colors text-neutral-900 dark:text-neutral-100"
												placeholder="JOHN DOE"
											/>
											<User className="absolute right-3 top-3 w-4 h-4 text-neutral-400" />
										</div>
									</div>
								)}

								<div className="space-y-2">
									<label className="font-sans text-xs font-medium text-neutral-900 dark:text-neutral-100 block">
										Email Address
									</label>
									<div className="relative">
										<input
											type="email"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-3 font-mono text-sm focus:outline-none focus:border-[#FF4D00] transition-colors text-neutral-900 dark:text-neutral-100"
											placeholder="OPERATIVE@STUDIO233.AI"
										/>
										<Mail className="absolute right-3 top-3 w-4 h-4 text-neutral-400" />
									</div>
								</div>

								<div className="space-y-2">
									<label className="font-sans text-xs font-medium text-neutral-900 dark:text-neutral-100 block">
										Password
									</label>
									<div className="relative">
										<input
											type="password"
											required
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-3 font-mono text-sm focus:outline-none focus:border-[#FF4D00] transition-colors text-neutral-900 dark:text-neutral-100"
											placeholder="••••••••••••"
										/>
										<Lock className="absolute right-3 top-3 w-4 h-4 text-neutral-400" />
									</div>
								</div>

								<button
									type="submit"
									disabled={isLoading}
									className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-sans text-sm font-bold py-3 px-4 flex items-center justify-between hover:bg-[#FF4D00] dark:hover:bg-[#FF4D00] hover:text-white dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
								>
									{isLoading ? (
										<span>PROCESSING...</span>
									) : (
										<span>
											{isSignUp ? "INITIALIZE_OPERATOR" : "AUTHENTICATE"}
										</span>
									)}
									{isLoading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
									)}
								</button>

								<div className="text-center pt-2">
									<button
										type="button"
										onClick={() => setIsSignUp(!isSignUp)}
										className="text-xs font-sans text-neutral-500 hover:text-[#FF4D00] transition-colors"
									>
										{isSignUp ? "Return to Login" : "Register New Operator"}
									</button>
								</div>
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
						<span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
						ACTIVE
					</span>
				</div>
			</div>
		</div>
	);
}
