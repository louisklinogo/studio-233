"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { SwissIcons } from "@/components/ui/SwissIcons";
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
				<div className="flex gap-2">
					<input
						type="email"
						required
						disabled={hasTicket}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="flex-1 bg-transparent border-b border-neutral-300 dark:border-neutral-700 py-2 font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors disabled:opacity-50"
						placeholder="EMAIL_ADDRESS"
					/>
					<button
						type="submit"
						disabled={isLoading || hasTicket}
						className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 font-mono text-xs uppercase hover:bg-[#FF4D00] hover:text-white transition-colors disabled:opacity-0"
					>
						{isLoading ? "PRINTING..." : "PRINT_TICKET"}
					</button>
				</div>

				{/* TICKET OUTPUT */}
				<AnimatePresence>
					{hasTicket && (
						<motion.div
							initial={{ y: -20, opacity: 0, rotateX: -15 }}
							animate={{ y: 0, opacity: 1, rotateX: 0 }}
							transition={{ type: "spring", stiffness: 120, damping: 20 }}
							className="mt-6 relative perspective-1000"
						>
							{/* TICKET BODY */}
							<div className="bg-white text-black p-6 shadow-lg border-t-4 border-[#FF4D00] font-mono relative">
								{/* Perforated Edge Effect */}
								<div className="absolute -top-3 left-0 right-0 h-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48Y2lyY2xlIGN4PSI2IiBjeT0iNiIgcj0iNCIgZmlsbD0iIzExMSIgLz48L3N2Zz4=')] opacity-10" />

								<div className="flex justify-between items-start mb-6 border-b border-dashed border-neutral-300 pb-4">
									<div>
										<div className="text-[10px] text-neutral-500 uppercase">
											PASS_ID
										</div>
										<div className="text-sm font-bold">
											#
											{Math.floor(Math.random() * 10000)
												.toString()
												.padStart(4, "0")}
										</div>
									</div>
									<div className="text-right">
										<div className="text-[10px] text-neutral-500 uppercase">
											DESTINATION
										</div>
										<div className="text-xs max-w-[150px] truncate">
											{email}
										</div>
									</div>
								</div>

								<div className="space-y-2 mb-6">
									<label className="text-[10px] uppercase block text-center">
										ENTER_VALIDATION_CODE
									</label>
									<input
										type="text"
										autoFocus
										value={otp}
										onChange={(e) => setOtp(e.target.value)}
										className="w-full bg-neutral-100 border border-neutral-200 py-3 text-center text-xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#FF4D00]"
										maxLength={6}
									/>
								</div>

								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => {
											setHasTicket(false);
											setOtp("");
										}}
										className="flex-1 py-3 text-[10px] uppercase border border-neutral-200 hover:bg-neutral-50"
									>
										DISCARD
									</button>
									<button
										type="submit"
										disabled={isLoading}
										className="flex-[2] py-3 text-[10px] font-bold uppercase bg-black text-white hover:bg-[#FF4D00] transition-colors"
									>
										{isLoading ? "VALIDATING..." : "ADMIT_ONE"}
									</button>
								</div>

								{/* Barcode Decoration */}
								<div className="mt-6 pt-4 border-t border-neutral-200 flex justify-center opacity-50">
									<div className="h-8 w-full bg-[repeating-linear-gradient(90deg,black,black_1px,transparent_1px,transparent_3px)]" />
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</form>
		</div>
	);
}
