"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { type AuthFetchContext, authClient } from "@/lib/auth-client";

export function LoginFormReceipt() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [hasTicket, setHasTicket] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;
		setIsLoading(true);
		try {
			await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
			setHasTicket(true);
		} catch (error) {
			toast.error("PRINTER ERROR");
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otp) return;
		setIsLoading(true);
		try {
			await authClient.signIn.emailOtp(
				{ email, otp },
				{
					onSuccess: () => {
						toast.success("TICKET VALIDATED");
						router.push("/dashboard");
					},
					onError: ({ error }: AuthFetchContext) => {
						toast.error(error.message);
					},
				},
			);
		} catch (error) {
			toast.error("INVALID TICKET");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-8 py-4">
			<form onSubmit={hasTicket ? handleVerifyOtp : handleSendOtp}>
				{/* INPUT AREA */}
				<div className="flex flex-col gap-6">
					<div className="space-y-2">
						<label className="font-mono text-[9px] text-neutral-500 block uppercase tracking-wider">
							EMAIL_ADDRESS
						</label>
						<div className="flex gap-2 items-end">
							<input
								type="email"
								required
								disabled={hasTicket}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="flex-1 bg-transparent border-b-2 border-border py-3 font-mono text-lg text-neutral-100 focus:outline-none focus:border-accent-critical transition-colors disabled:text-neutral-500 rounded-none placeholder:text-neutral-800"
								placeholder="USER@DOMAIN.COM"
							/>
							<button
								type="submit"
								disabled={isLoading || hasTicket}
								className={`relative px-5 h-11 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
									isLoading || hasTicket
										? "opacity-50 cursor-not-allowed bg-[#1a1a1a] text-neutral-500"
										: "bg-[#1a1a1a] text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)] border-t border-l border-white/5 border-b border-black hover:bg-black"
								}`}
							>
								{/* Orange indicator on top of key */}
								{!isLoading && !hasTicket && (
									<div className="absolute top-0 left-0 w-full h-[1px] bg-accent-critical/50" />
								)}
								<span className="relative z-10">
									{isLoading ? "PRINTING..." : "PRINT_TICKET"}
								</span>
							</button>
						</div>
					</div>
				</div>

				{/* TICKET OUTPUT */}
				<AnimatePresence>
					{hasTicket && (
						<motion.div
							initial={{ y: -20, opacity: 0, rotateX: -15 }}
							animate={{ y: 0, opacity: 1, rotateX: 0 }}
							exit={{ y: 20, opacity: 0 }}
							transition={{ type: "spring", stiffness: 120, damping: 20 }}
							className="mt-8 relative perspective-1000"
						>
							{/* TICKET BODY */}
							<div className="bg-[#f5f5f5] text-black p-0 shadow-xl border-t-4 border-accent-critical font-mono relative max-w-sm mx-auto overflow-hidden">
								{/* Perforated Edge Effect (Top) */}
								<div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#f5f5f5_4px,#f5f5f5_8px)]" />

								{/* Header Section */}
								<div className="bg-[#e5e5e5] p-4 border-b border-dashed border-neutral-400">
									<div className="flex justify-between items-start">
										<div>
											<div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">
												TERMINAL_PASS
											</div>
											<div className="text-xl font-bold tracking-tight">
												ACCESS-
												{Math.floor(Math.random() * 1000)
													.toString()
													.padStart(3, "0")}
											</div>
										</div>
										<div className="text-right">
											<div className="inline-block px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider">
												VALID_ENTRY
											</div>
										</div>
									</div>
								</div>

								{/* Body Section */}
								<div className="p-6 space-y-6">
									<div className="space-y-1">
										<div className="text-[9px] text-neutral-500 uppercase tracking-widest">
											ISSUED_TO
										</div>
										<div className="text-sm font-medium break-all border-b border-neutral-300 pb-2">
											{email}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-[9px] uppercase tracking-widest block text-center text-neutral-500">
											VERIFICATION_CODE
										</label>
										<input
											type="text"
											autoFocus
											value={otp}
											onChange={(e) => setOtp(e.target.value)}
											className="w-full bg-white border-2 border-black py-3 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-accent-critical transition-colors placeholder:text-neutral-200"
											placeholder="000000"
											maxLength={6}
										/>
									</div>

									<div className="flex gap-3 pt-2">
										<button
											type="button"
											onClick={() => {
												setHasTicket(false);
												setOtp("");
											}}
											className="flex-1 py-3 text-[9px] font-mono uppercase font-bold border border-neutral-300 hover:bg-neutral-200 transition-colors tracking-widest text-neutral-600"
										>
											DISCARD
										</button>
										<button
											type="submit"
											disabled={isLoading}
											className="flex-[2] py-3 text-[9px] font-mono font-bold uppercase bg-black text-white hover:bg-accent-critical transition-all tracking-[0.2em] shadow-lg"
										>
											{isLoading ? "VALIDATING..." : "ADMIT_ONE"}
										</button>
									</div>
								</div>

								{/* Footer / Barcode */}
								<div className="bg-[#e5e5e5] p-4 border-t border-dashed border-neutral-400 flex flex-col items-center gap-2 opacity-80">
									<div className="h-6 w-3/4 bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_4px)]" />
									<div className="text-[8px] uppercase tracking-[0.3em] text-neutral-500">
										NON-TRANSFERABLE
									</div>
								</div>

								{/* Bottom jagged edge */}
								<div
									className="absolute bottom-0 left-0 right-0 h-2 bg-white"
									style={{
										clipPath:
											"polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
									}}
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</form>
		</div>
	);
}
