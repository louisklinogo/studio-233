"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AsciiCarousel } from "@/components/landing/AsciiCarousel";
import { BootSequence } from "@/components/landing/BootSequence";
import { DataTicker } from "@/components/landing/DataTicker";
import { GlitchCoordinates } from "@/components/landing/GlitchCoordinates";
import { GlitchHeader } from "@/components/landing/GlitchHeader";
import { MenuLink } from "@/components/landing/MenuLink";
import { ReactiveGrid } from "@/components/landing/ReactiveGrid";
import { ScannerFooter } from "@/components/landing/ScannerFooter";
import { StatusPill } from "@/components/landing/StatusPill";

export default function HomePage() {
	const [isBooted, setIsBooted] = useState(false);

	return (
		<>
			<BootSequence onComplete={() => setIsBooted(true)} />

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: isBooted ? 1 : 0 }}
				transition={{ duration: 1 }}
				className="h-dvh bg-[#f4f4f0] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-50 p-6 md:p-12 pb-16 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col justify-between overflow-hidden relative"
			>
				{/* Reactive Background Grid */}
				<ReactiveGrid />

				{/* Header */}
				<header className="relative z-10 flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 pb-6">
					<GlitchHeader />
					<div className="text-right hidden md:flex flex-col items-end gap-1">
						<StatusPill />
						<GlitchCoordinates />
					</div>
				</header>

				{/* Main Content Grid */}
				<main className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-y-6 md:gap-12 flex-1 items-center overflow-hidden">
					{/* ASCII Art Column */}
					<div className="md:col-span-7 flex flex-col justify-center items-center md:items-start w-full">
						<AsciiCarousel />
					</div>

					{/* Navigation Column (The "Index") */}
					<div className="md:col-span-5 flex flex-col justify-center gap-8 pl-4 md:pl-0">
						{/* Nav Item 01 */}
						<MenuLink
							href="/canvas"
							number="01"
							label="Canvas"
							description="// NEW_PROJECT / WORKBENCH"
						/>

						{/* Nav Item 02 */}
						<MenuLink
							href="/studio"
							number="02"
							label="Studio"
							description="// BATCH_PROCESSING / PIPELINES"
						/>
					</div>
				</main>

				{/* Footer */}
				<footer className="relative z-10 flex flex-col justify-end mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4 shrink-0">
					<div className="flex justify-between items-end text-xs font-mono text-neutral-500 uppercase mb-2 px-1">
						<div className="flex gap-4">
							<span>© 2025</span>
							<span>Studio+233 Systems</span>
						</div>
						<div className="flex gap-4">
							<a
								href="#"
								className="hover:text-neutral-900 dark:hover:text-white transition-colors"
							>
								Docs
							</a>
							<a
								href="#"
								className="hover:text-neutral-900 dark:hover:text-white transition-colors"
							>
								Legal
							</a>
						</div>
					</div>

					{/* Massive Typographic Footer */}
					<ScannerFooter />
				</footer>

				{/* Data Ticker */}
				<DataTicker />
			</motion.div>
		</>
	);
}
