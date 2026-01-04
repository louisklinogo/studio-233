"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BraunConsole } from "@/components/auth/BraunConsole";
import { LoginForm } from "@/components/auth/LoginForm";
import { ReactiveGrid } from "@/components/landing/ReactiveGrid";
import { Magnetic } from "@/components/ui/Magnetic";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function LoginPageView() {
	return (
		<div className="min-h-dvh bg-[#f4f4f0] text-[#1a1a1a] font-sans selection:bg-[#FF4D00] selection:text-white relative overflow-hidden flex flex-col md:grid md:grid-cols-2">
			{/* Persistent Background Grid (Inherited from Landing) */}
			<div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
				<ReactiveGrid />
			</div>

			{/* --- LEFT SIDE: THE TYPOGRAPHY MONOLITH --- */}
			<div className="relative hidden md:flex border-r border-neutral-200 overflow-hidden z-10 bg-[#f4f4f0] items-center">
				{/* 1. Fine Technical Grid (Ambient Calm) */}
				<div
					className="absolute inset-0 opacity-[0.02] pointer-events-none"
					style={{
						backgroundImage: `linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)`,
						backgroundSize: "100px 100px",
					}}
				/>

				{/* 2. The Monolith (Subtle, Tone-on-Tone Typography) */}
				<div className="relative -left-[5vw] select-none">
					<h1
						className="text-[45vw] leading-none font-black tracking-[-0.05em] text-[#e8e8e3]"
						style={{
							fontFamily: "var(--font-geist-sans)",
							textShadow: "1px 1px 0px rgba(255,255,255,0.5)", // Subtle edge definition
						}}
					>
						233
					</h1>

					{/* Technical Detail Overlays */}
					<div className="absolute top-1/2 left-[10vw] -translate-y-1/2 flex flex-col gap-4 opacity-30 font-mono text-[9px] tracking-[0.3em] text-neutral-400">
						<span>[ VER_3.0.1 ]</span>
						<span>[ SYNC_STABLE ]</span>
						<span>[ GRID_LOCK_ON ]</span>
					</div>
				</div>

				{/* 3. Swiss Poster Metadata */}
				<div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
					<div className="flex flex-col gap-3">
						<div className="w-16 h-[1px] bg-neutral-200" />
						<div className="flex flex-col">
							<span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1">
								Core Interface
							</span>
							<span className="font-sans text-sm font-bold text-neutral-400 tracking-tighter uppercase">
								Studio+233 Systems
							</span>
						</div>
					</div>

					<div className="text-right font-mono text-[9px] text-neutral-300 leading-relaxed">
						INTERNATIONAL TYPOGRAPHIC STYLE
						<br />
						REFERENCE_FRAME: CH-2025
					</div>
				</div>
			</div>

			{/* --- RIGHT SIDE: THE CHASSIS --- */}
			<div className="relative flex flex-col h-full bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none z-20">
				{/* Top Bar */}
				<header className="relative z-50 flex justify-between items-start p-6 md:p-12">
					<div className="pointer-events-auto">
						<Magnetic range={60} stiffness={350}>
							<Link href="/" className="group flex items-center gap-4 p-2 -m-2">
								<div className="relative w-10 h-10 bg-white border border-neutral-200 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:border-[#FF4D00]/50">
									<SwissIcons.ArrowUpRight
										className="text-neutral-400 group-hover:text-[#FF4D00] rotate-180 transition-all duration-500 group-hover:scale-110"
										size={18}
									/>
								</div>

								<div className="flex flex-col">
									<span className="font-mono text-[9px] text-neutral-400 uppercase tracking-[0.3em] group-hover:text-[#FF4D00] transition-colors duration-300 leading-none">
										System_Return
									</span>
									<span className="font-bold text-[10px] tracking-tighter text-neutral-500 group-hover:text-neutral-900 transition-colors duration-300">
										BACK_TO_VORTEX
									</span>
								</div>
							</Link>
						</Magnetic>
					</div>
				</header>

				{/* Interaction Console */}
				<main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12">
					<BraunConsole>
						<LoginForm />
					</BraunConsole>
				</main>

				{/* HUD Continuity Footer */}
				<footer className="relative z-10 p-6 md:p-12 flex justify-between items-end text-[9px] font-mono text-neutral-400 uppercase tracking-widest border-t border-neutral-100 bg-[#efefe9]/50 backdrop-blur-sm md:bg-transparent">
					<div className="flex flex-col gap-1">
						<span className="text-neutral-400">GATEWAY: V3.0_KINETIC</span>
						<span className="flex items-center gap-2">
							<div className="w-1 h-1 bg-emerald-500 rounded-full" />
							ENCRYPTION: AES-256-GCM
						</span>
					</div>
					<div className="text-right flex flex-col gap-1 items-end">
						<span className="text-neutral-500 uppercase tracking-tighter font-bold">
							Secure Handshake Required
						</span>
						<span className="text-neutral-400 tracking-normal text-[8px]">
							LOG_IP: 127.0.0.1 (DEV_BYPASS)
						</span>
					</div>
				</footer>
			</div>
		</div>
	);
}
