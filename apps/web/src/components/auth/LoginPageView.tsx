"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AuthTerminal } from "@/components/auth/AuthTerminal";
import { LoginForm } from "@/components/auth/LoginForm";
import { ReactiveGrid } from "@/components/landing/ReactiveGrid";
import { StatusPill } from "@/components/landing/StatusPill";

export function LoginPageView() {
	return (
		<div className="min-h-dvh bg-[#f4f4f0] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-50 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black relative overflow-hidden">
			<ReactiveGrid />

			<div className="absolute top-6 left-6 z-50">
				<Link href="/" className="group flex items-center gap-2">
					<div className="w-2 h-2 bg-neutral-400 group-hover:bg-emerald-500 transition-colors" />
					<span className="font-mono text-[10px] text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
						RETURN_TO_ROOT
					</span>
				</Link>
			</div>

			<div className="absolute top-6 right-6 z-50">
				<StatusPill />
			</div>

			<main className="relative z-10 min-h-dvh flex flex-col items-center justify-center p-6">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="mb-8 text-center"
				>
					<h1 className="font-bold text-2xl md:text-3xl tracking-tighter mb-2">
						STUDIO+233
					</h1>
					<p className="font-mono text-[10px] text-neutral-500 tracking-[0.2em]">
						CREATIVE_OPERATING_SYSTEM
					</p>
				</motion.div>

				<AuthTerminal>
					<LoginForm />
				</AuthTerminal>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5, duration: 1 }}
					className="absolute bottom-6 left-0 right-0 text-center"
				>
					<p className="font-mono text-[9px] text-neutral-400 opacity-50">
						UNAUTHORIZED ACCESS ATTEMPTS WILL BE LOGGED AND REPORTED
					</p>
				</motion.div>
			</main>
		</div>
	);
}
