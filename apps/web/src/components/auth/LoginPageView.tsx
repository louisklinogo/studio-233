"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AuthTerminal } from "@/components/auth/AuthTerminal";
import { LoginForm } from "@/components/auth/LoginForm";
import { ReactiveGrid } from "@/components/landing/ReactiveGrid";
import { Magnetic } from "@/components/ui/Magnetic";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function LoginPageView() {
	return (
		<div className="dark min-h-dvh bg-[#0a0a0a] text-foreground font-sans selection:bg-accent-critical selection:text-white dark:selection:text-black relative overflow-hidden flex flex-col">
			{/* Background Texture (Subtle Noise) */}
			<div
				className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
				}}
			/>

			{/* Reactive Background Grid */}
			<ReactiveGrid />

			{/* Top Bar */}
			<header className="relative z-50 flex justify-between items-start p-6 md:p-12 pointer-events-none">
				<div className="pointer-events-auto">
					<Magnetic range={60} stiffness={350}>
						<Link href="/" className="group flex items-center gap-4 p-2 -m-2">
							<div className="relative w-10 h-10 bg-[#050505] border border-[#1a1a1a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-300 group-hover:border-[#FF4D00]/50 group-hover:shadow-[0_0_20px_rgba(255,77,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.05)]">
								{/* Strobe Effect on Hover */}
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[#FF4D00]/5 animate-pulse transition-opacity" />

								<SwissIcons.ArrowUpRight
									className="text-neutral-700 group-hover:text-[#FF4D00] rotate-180 transition-all duration-500 group-hover:scale-110"
									size={18}
								/>

								{/* Corner Screws for industrial feel */}
								<div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-neutral-900 rounded-full" />
								<div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-neutral-900 rounded-full" />
								<div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-neutral-900 rounded-full" />
								<div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-neutral-900 rounded-full" />
							</div>

							<div className="flex flex-col">
								<span className="font-mono text-[9px] text-neutral-500 uppercase tracking-[0.3em] group-hover:text-[#FF4D00] transition-colors duration-300 leading-none">
									Abort_Sequence
								</span>
								<span className="font-bold text-[10px] tracking-tighter text-neutral-400 group-hover:text-neutral-100 transition-colors duration-300">
									RETURN_TO_ROOT
								</span>
							</div>
						</Link>
					</Magnetic>
				</div>

				<div className="pointer-events-auto" />
			</header>

			{/* Main Content */}
			<main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 -mt-12">
				{/* Branding Block */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="mb-12 text-center flex flex-col items-center gap-2"
				>
					<div className="flex items-center gap-4 mb-2">
						<div className="h-px w-8 bg-neutral-900" />
						<span className="font-mono text-[10px] text-[#FF4D00] tracking-[0.3em]">
							AUTHENTICATION
						</span>
						<div className="h-px w-8 bg-neutral-900" />
					</div>

					<h1
						className="font-bold text-5xl md:text-7xl tracking-tighter text-white/90 leading-tight"
						style={{
							textShadow:
								"0px 1px 0px rgba(255,255,255,0.05), inset 0px 2px 4px rgba(0,0,0,0.8)",
						}}
					>
						STUDIO+233
					</h1>

					<div className="flex items-center gap-3 text-[9px] font-mono text-neutral-400 tracking-[0.5em] uppercase mt-2">
						<span className="flex items-center gap-1.5">
							<div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] animate-pulse shadow-[0_0_8px_#FF4D00]" />
							SYS.VER.2.0
						</span>
						<div className="h-3 w-[1px] bg-neutral-800" />
						<span>SECURE_ENTRY_ESTABLISHED</span>
					</div>
				</motion.div>

				<AuthTerminal>
					<LoginForm />
				</AuthTerminal>
			</main>

			{/* Footer Info */}
			<motion.footer
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5, duration: 1 }}
				className="relative z-10 p-6 md:p-12 flex justify-between items-end text-[9px] font-mono text-neutral-400 uppercase tracking-widest border-t border-neutral-900/50"
			>
				<div className="flex flex-col gap-1">
					<span className="text-neutral-500">GATEWAY: V2.0_SECURE</span>
					<span className="flex items-center gap-2">
						<div className="w-1 h-1 bg-emerald-500 rounded-full" />
						ENCRYPTION: AES-256-GCM
					</span>
				</div>
				<div className="text-right flex flex-col gap-1 items-end">
					<span className="text-neutral-500 uppercase tracking-tighter font-bold">
						Unauthorized Access is Prohibited
					</span>
					<span className="text-neutral-600 tracking-normal text-[8px]">
						LOG_IP: 127.0.0.1 (DEV_BYPASS)
					</span>
				</div>
			</motion.footer>
		</div>
	);
}
