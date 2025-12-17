"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AuthTerminal } from "@/components/auth/AuthTerminal";
import { LoginForm } from "@/components/auth/LoginForm";
import { ReactiveGrid } from "@/components/landing/ReactiveGrid";
import { StatusPill } from "@/components/landing/StatusPill";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function LoginPageView() {
	return (
		<div className="min-h-dvh bg-[#0a0a0a] text-[#e5e5e5] font-sans selection:bg-[#FF4D00] selection:text-black relative overflow-hidden flex flex-col">
			{/* Reactive Background Grid */}
			<ReactiveGrid />

			{/* Top Bar */}
			<header className="relative z-50 flex justify-between items-start p-6 md:p-12 pointer-events-none">
				<Link
					href="/"
					className="pointer-events-auto group flex items-center gap-3"
				>
					<div className="w-8 h-8 border border-neutral-800 bg-[#111] flex items-center justify-center group-hover:border-[#FF4D00] transition-colors">
						<SwissIcons.ArrowUpRight
							className="text-neutral-500 group-hover:text-[#FF4D00] rotate-180 transition-colors"
							size={16}
						/>
					</div>
					<div className="flex flex-col">
						<span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest group-hover:text-[#FF4D00] transition-colors">
							Abort Sequence
						</span>
						<span className="font-bold text-xs tracking-tight">
							RETURN TO ROOT
						</span>
					</div>
				</Link>

				<div className="pointer-events-auto">
					<StatusPill />
				</div>
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
						<div className="h-px w-8 bg-neutral-800" />
						<span className="font-mono text-[10px] text-[#FF4D00] tracking-[0.3em]">
							AUTHENTICATION
						</span>
						<div className="h-px w-8 bg-neutral-800" />
					</div>
					<h1 className="font-bold text-4xl md:text-5xl tracking-tighter text-white">
						STUDIO+233
					</h1>
					<div className="flex gap-1 mt-1">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="w-1 h-1 bg-neutral-800 rounded-full" />
						))}
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
				className="relative z-10 p-6 md:p-12 flex justify-between items-end text-[9px] font-mono text-neutral-600 uppercase tracking-widest border-t border-neutral-900/50"
			>
				<div>
					SECURE_GATEWAY_V2.0
					<br />
					ENCRYPTION: AES-256
				</div>
				<div className="text-right">
					UNAUTHORIZED ACCESS
					<br />
					IS PROHIBITED
				</div>
			</motion.footer>
		</div>
	);
}
