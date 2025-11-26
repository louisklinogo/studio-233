"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AsciiCarousel } from "@/components/landing/AsciiCarousel";
import { BootSequence } from "@/components/landing/BootSequence";
import { DataTicker } from "@/components/landing/DataTicker";
import { GlitchCoordinates } from "@/components/landing/GlitchCoordinates";
import { GlitchHeader } from "@/components/landing/GlitchHeader";
import { GlitchOverlay } from "@/components/landing/GlitchOverlay";
import { ManifestoGSAP } from "@/components/landing/ManifestoGSAP";
import { MenuLink } from "@/components/landing/MenuLink";
import { NavigatorPrompt } from "@/components/landing/NavigatorPrompt";
import { PhysicalThemeSwitch } from "@/components/landing/PhysicalThemeSwitch";
import { ReactiveGrid } from "@/components/landing/ReactiveGrid";
import { ScannerFooter } from "@/components/landing/ScannerFooter";
import { StatusPill } from "@/components/landing/StatusPill";
import { ThemeToggle } from "@/components/landing/ThemeToggle";

import { CustomCursor } from "@/components/ui/CustomCursor";

export default function HomePage() {
	const [isBooted, setIsBooted] = useState(false);

	return (
		<>
			<CustomCursor />
			<BootSequence onComplete={() => setIsBooted(true)} />

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: isBooted ? 1 : 0 }}
				transition={{ duration: 1 }}
				className="min-h-dvh bg-[#f4f4f0] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-50 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col relative"
			>
				{/* Reactive Background Grid */}
				<ReactiveGrid />

				{/* Header */}
				<header className="relative z-10 flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 p-6 md:p-12 pb-6">
					<div className="flex flex-col gap-1">
						<h1 className="sr-only">Studio+233: AI-Native Creative Suite</h1>
						<GlitchHeader />
						<p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-2 hidden md:block">
							The AI-Native Creative Suite for High-Volume Production
						</p>
					</div>
					<div className="text-right hidden md:flex flex-col items-end gap-4">
						<div className="flex items-center gap-4">
							<PhysicalThemeSwitch />
							<StatusPill />
						</div>
						<GlitchCoordinates />
					</div>
				</header>

				{/* Hero Section */}
				<section className="relative z-10 w-full border-b border-neutral-200 dark:border-neutral-800">
					<AsciiCarousel />
				</section>

				{/* Manifesto Section */}
				<ManifestoGSAP />

				{/* Navigator Prompt */}
				<NavigatorPrompt />

				{/* Main Navigation Grid */}
				<main className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 flex-1">
					{/* Glitch Overlay */}
					<GlitchOverlay />

					{/* Nav Item 01: Canvas */}
					<section className="border-b md:border-b-0 border-r-0 md:border-r border-neutral-200 dark:border-neutral-800 p-6 md:p-12 flex flex-col justify-center min-h-[40vh]">
						<h2 className="sr-only">Infinite Canvas</h2>
						<MenuLink
							href="/login"
							number="01"
							label="Canvas"
							description="// AI_POWERED_CANVAS / GENERATE_&_EDIT"
						/>
					</section>

					{/* Nav Item 02: Studio */}
					<section className="p-6 md:p-12 flex flex-col justify-center min-h-[40vh]">
						<h2 className="sr-only">Batch Studio</h2>
						<MenuLink
							href="/login"
							number="02"
							label="Studio"
							description="// BATCH_PIPELINES / SCALE_YOUR_WORKFLOW"
						/>
					</section>
				</main>

				{/* Footer */}
				<footer className="relative z-10 flex flex-col justify-end border-t border-neutral-200 dark:border-neutral-800 pt-4 shrink-0 min-h-[40vh]">
					<div className="flex justify-between items-end text-xs font-mono text-neutral-500 uppercase mb-2 px-6 md:px-12">
						<div className="flex gap-4">
							<span>© 2025</span>
							<span>■ Studio+233 Systems</span>
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
					<div aria-hidden="true">
						<ScannerFooter />
					</div>
				</footer>

				{/* Data Ticker */}
				<DataTicker />
			</motion.div>
		</>
	);
}
