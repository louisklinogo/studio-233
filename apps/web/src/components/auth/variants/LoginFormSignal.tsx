"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { type AuthFetchContext, authClient } from "@/lib/auth-client";

export function LoginFormSignal() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [status, setStatus] = useState<
		"idle" | "sending" | "sent" | "verifying"
	>("idle");
	const router = useRouter();

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;
		setStatus("sending");
		try {
			await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
			setStatus("sent");
		} catch (error) {
			setStatus("idle");
			toast.error("SIGNAL FAILURE");
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otp) return;
		setStatus("verifying");
		try {
			await authClient.signIn.emailOtp(
				{ email, otp },
				{
					onSuccess: () => {
						toast.success("SIGNAL ESTABLISHED");
						router.push("/dashboard");
					},
					onError: ({ error }: AuthFetchContext) => {
						toast.error(error.message);
						setStatus("sent");
					},
				},
			);
		} catch (error) {
			setStatus("sent");
			toast.error("AUTH FAILED");
		}
	};

	return (
		<div className="space-y-6 py-8 relative">
			{/* SIGNAL STATUS BAR */}
			<div className="absolute top-0 right-0 font-mono text-[9px] text-[#FF4D00] flex items-center gap-2">
				{status !== "idle" && (
					<span className="animate-pulse">TRANSMITTING...</span>
				)}
				<div className="flex gap-0.5">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className={`w-1 h-3 transition-colors ${
								status === "idle"
									? "bg-neutral-200 dark:bg-neutral-800"
									: "bg-[#FF4D00]"
							}`}
							style={{ opacity: status === "idle" ? 1 : Math.random() }} // Fake signal noise
						/>
					))}
				</div>
			</div>

			<form
				onSubmit={status === "idle" ? handleSendOtp : handleVerifyOtp}
				className="space-y-6"
			>
				<div className="space-y-2">
					<label className="font-mono text-[9px] text-neutral-500 block uppercase tracking-wider">
						COMMS_CHANNEL
					</label>
					<div className="relative">
						<input
							type="email"
							required
							disabled={status !== "idle"}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className={`w-full bg-transparent border-b-2 px-0 py-3 font-mono text-lg focus:outline-none rounded-none transition-colors ${
								status === "idle"
									? "border-neutral-300 dark:border-neutral-700 focus:border-[#FF4D00]"
									: "border-[#FF4D00] text-[#FF4D00]"
							}`}
							placeholder="ENTER_EMAIL..."
						/>
						{status !== "idle" && (
							<button
								type="button"
								onClick={() => {
									setStatus("idle");
									setOtp("");
								}}
								className="absolute right-0 top-3 text-[9px] font-mono text-neutral-400 hover:text-[#FF4D00] underline"
							>
								RESET_SIGNAL
							</button>
						)}
					</div>
				</div>

				<AnimatePresence>
					{status !== "idle" && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="space-y-2"
						>
							<label className="font-mono text-[9px] text-neutral-500 block uppercase tracking-wider">
								VERIFICATION_TOKEN
							</label>
							<input
								type="text"
								inputMode="numeric"
								maxLength={6}
								autoFocus
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
								className="w-full bg-neutral-100 dark:bg-neutral-900 border-none px-4 py-4 font-mono text-xl tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-[#FF4D00] text-center"
								placeholder="000 000"
							/>
						</motion.div>
					)}
				</AnimatePresence>

				<button
					type="submit"
					disabled={status === "sending" || status === "verifying"}
					className="w-full h-14 relative overflow-hidden bg-black dark:bg-white text-white dark:text-black font-mono text-sm uppercase tracking-widest disabled:opacity-70 group"
				>
					<span className="relative z-10 flex items-center justify-center gap-2">
						{status === "idle" && "INITIATE_SEQUENCE"}
						{status === "sending" && "SENDING_PACKET..."}
						{status === "sent" && "CONFIRM_TOKEN"}
						{status === "verifying" && "DECRYPTING..."}
					</span>

					{/* Progress Bar Fill */}
					{(status === "sending" || status === "verifying") && (
						<motion.div
							className="absolute inset-0 bg-[#FF4D00] z-0"
							initial={{ x: "-100%" }}
							animate={{ x: "0%" }}
							transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
						/>
					)}
				</button>
			</form>
		</div>
	);
}
