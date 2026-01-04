"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { type AuthFetchContext, authClient } from "@/lib/auth-client";
import { isPrintingAtom } from "../auth-state";

export function LoginFormReceipt() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [hasTicket, setHasTicket] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [, setIsPrinting] = useAtom(isPrintingAtom);
	const router = useRouter();

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;
		setIsLoading(true);
		setIsPrinting(true);
		try {
			await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
			setHasTicket(true);
		} catch (error) {
			toast.error("PRINTER ERROR");
			setIsPrinting(false);
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

	// Reset printing state when ticket is discarded
	const discardTicket = () => {
		setHasTicket(false);
		setOtp("");
		setIsPrinting(false);
	};

	return (
		<div className="relative">
			<form onSubmit={hasTicket ? handleVerifyOtp : handleSendOtp}>
				{/* Step 1: Identity Input (Sequential Deconstruction) */}
				<AnimatePresence mode="wait">
					{!hasTicket ? (
						<motion.div
							key="step-1"
							initial={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
							transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
							className="space-y-8"
						>
							{/* Printer Slot Interface */}
							<div className="relative">
								<div className="h-1.5 w-full bg-[#1a1a1a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] rounded-full relative overflow-hidden">
									{isLoading && (
										<motion.div
											animate={{ x: ["-100%", "100%"] }}
											transition={{
												duration: 0.5,
												repeat: Infinity,
												ease: "linear",
											}}
											className="absolute inset-0 w-1/3 bg-[#FF4D00] shadow-[0_0_10px_#FF4D00]"
										/>
									)}
								</div>
								<div className="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[7px] text-neutral-400 uppercase tracking-[0.5em]">
									Standby_For_Ticket
								</div>
							</div>

							<div className="space-y-2 pt-4">
								<label className="font-mono text-[9px] text-neutral-400 block uppercase tracking-wider">
									EMAIL_ADDRESS
								</label>
								<div className="flex gap-2 items-end">
									<input
										type="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="flex-1 bg-transparent border-b-2 border-neutral-200 py-3 font-mono text-lg text-neutral-900 focus:outline-none focus:border-[#FF4D00] transition-colors rounded-none placeholder:text-neutral-200"
										placeholder="USER@DOMAIN.COM"
									/>
									<button
										type="submit"
										disabled={isLoading}
										className="relative px-5 h-11 font-mono text-[10px] uppercase tracking-[0.2em] bg-[#1a1a1a] text-white shadow-lg border-t border-l border-white/10 border-b border-black hover:bg-black transition-all"
									>
										<div className="absolute top-0 left-0 w-full h-[1px] bg-[#FF4D00]/50" />
										<span className="relative z-10">
											{isLoading ? "PRINTING..." : "PRINT_TICKET"}
										</span>
									</button>
								</div>
							</div>
						</motion.div>
					) : (
						/* Step 2: Full Physical Ticket & OTP */
						<motion.div
							key="step-2"
							initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
							className="space-y-6"
						>
							<motion.div
								initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
								animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
								transition={{ duration: 1.5, ease: "linear" }}
								className="relative perspective-1000 origin-top"
							>
								{/* TICKET BODY */}
								<div className="bg-white text-black p-0 shadow-2xl border-t-2 border-[#FF4D00] font-mono relative max-w-sm mx-auto overflow-hidden">
									{/* Perforated Edge Effect */}
									<div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#fff_4px,#fff_8px)]" />

									<div className="bg-[#fcfcfc] p-4 border-b border-dashed border-neutral-200 flex justify-between items-start">
										<div>
											<div className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1">
												TERMINAL_PASS
											</div>
											<div className="text-xl font-bold tracking-tight text-neutral-900">
												ACCESS-
												{Math.floor(Math.random() * 1000)
													.toString()
													.padStart(3, "0")}
											</div>
										</div>
										<div className="inline-block px-2 py-0.5 bg-[#FF4D00] text-white text-[9px] font-bold uppercase tracking-wider">
											VALID_ENTRY
										</div>
									</div>

									<div className="p-6 space-y-6">
										<div className="space-y-1">
											<div className="text-[9px] text-neutral-400 uppercase tracking-widest">
												ISSUED_TO
											</div>
											<div className="text-[11px] font-bold break-all border-b border-neutral-100 pb-2 text-[#1a1a1a]">
												{email}
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-[9px] uppercase tracking-widest block text-center text-neutral-400">
												VERIFICATION_CODE
											</label>
											<input
												type="text"
												autoFocus
												value={otp}
												onChange={(e) => setOtp(e.target.value)}
												className="w-full bg-neutral-50 border border-neutral-200 py-3 text-center text-2xl tracking-[0.5em] font-bold text-neutral-900 focus:outline-none focus:border-[#FF4D00] transition-colors placeholder:text-neutral-100"
												placeholder="000000"
												maxLength={6}
											/>
										</div>

										<div className="flex gap-3 pt-2">
											<button
												type="button"
												onClick={discardTicket}
												className="flex-1 py-3 text-[9px] font-mono uppercase font-bold border border-neutral-200 hover:bg-neutral-50 transition-colors tracking-widest text-neutral-400"
											>
												DISCARD
											</button>
											<button
												type="submit"
												disabled={isLoading}
												className="flex-[2] py-3 text-[9px] font-mono font-bold uppercase bg-[#1a1a1a] text-white hover:bg-black transition-all tracking-[0.2em] shadow-lg"
											>
												{isLoading ? "VALIDATING..." : "ADMIT_ONE"}
											</button>
										</div>
									</div>

									<div className="bg-[#fcfcfc] p-4 border-t border-dashed border-neutral-200 flex flex-col items-center gap-2 opacity-80">
										<div className="h-6 w-3/4 bg-[repeating-linear-gradient(90deg,#1a1a1a,#1a1a1a_2px,transparent_2px,transparent_4px)]" />
										<div className="text-[8px] uppercase tracking-[0.3em] text-neutral-300">
											NON-TRANSFERABLE
										</div>
									</div>

									<div
										className="absolute bottom-0 left-0 right-0 h-2 bg-white"
										style={{
											clipPath:
												"polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
										}}
									/>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</form>
		</div>
	);
}
