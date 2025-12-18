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
			{/* Physical Signal Meter */}
			<div className="absolute top-4 right-0 flex flex-col items-end gap-1.5">
				<div className="flex items-center gap-2 bg-[#0a0a0a] px-2 py-1.5 border border-[#1a1a1a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] rounded-[1px]">
					<span className="font-mono text-[6px] text-neutral-600 uppercase tracking-tighter">
						SIGNAL_LOAD
					</span>
					<div className="flex items-end gap-[1.5px] h-3">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className={`w-[1.5px] transition-all duration-500 rounded-px ${
									status === "idle"
										? "bg-neutral-800 h-1"
										: i <= 2
											? "bg-accent-critical h-3 shadow-[0_0_8px_rgba(234,88,12,0.6)]"
											: "bg-neutral-900 h-1.5"
								}`}
							/>
						))}
					</div>
				</div>
				<div className="font-mono text-[5px] text-neutral-700 tracking-[0.3em] uppercase px-1">
					Packet_Flow: Established
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
									? "border-border focus:border-accent-critical text-neutral-100"
									: "border-accent-critical text-accent-critical opacity-80"
							} disabled:text-neutral-400`}
							placeholder="ENTER_EMAIL..."
						/>
						{status !== "idle" && (
							<button
								type="button"
								onClick={() => {
									setStatus("idle");
									setOtp("");
								}}
								className="absolute right-0 top-3 text-[9px] font-mono text-muted-foreground hover:text-accent-critical underline"
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
								className="w-full bg-[#050505] border border-[#1a1a1a] px-4 py-4 font-mono text-xl tracking-[0.5em] focus:outline-none focus:border-accent-critical focus:ring-0 text-neutral-100 text-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
								placeholder="000 000"
							/>
						</motion.div>
					)}
				</AnimatePresence>

				<button
					type="submit"
					disabled={status === "sending" || status === "verifying"}
					className="w-full h-14 relative overflow-hidden bg-foreground text-background font-mono text-sm uppercase tracking-widest disabled:opacity-70 group"
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
							className="absolute inset-0 bg-accent-critical z-0"
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
