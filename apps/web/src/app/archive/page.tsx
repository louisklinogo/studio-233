"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AsciiCarousel } from "@/components/landing/AsciiCarousel";
import { BootSequence } from "@/components/landing/BootSequence";
import { DataTicker } from "@/components/landing/DataTicker";
import { DeconstructedUI } from "@/components/landing/DeconstructedUI";
import { GlitchCoordinates } from "@/components/landing/GlitchCoordinates";
import { GlitchHeader } from "@/components/landing/GlitchHeader";
import { InfiniteArchive } from "@/components/landing/InfiniteArchive";
import { LaunchKeyFooter } from "@/components/landing/LaunchKeyFooter";
import { ManifestoGSAP } from "@/components/landing/ManifestoGSAP";
import { PhysicalThemeSwitch } from "@/components/landing/PhysicalThemeSwitch";
import { ReactiveGrid } from "@/components/landing/ReactiveGrid";
import { StatusPill } from "@/components/landing/StatusPill";
import { SystemOverlay } from "@/components/landing/SystemOverlay";

import { CustomCursor } from "@/components/ui/CustomCursor";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

type OverlayType = "modules" | "pricing" | "protocols" | "manifesto" | null;

export default function HomePage() {
	const [isBooted, setIsBooted] = useState(false);
	const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);

	const scrollToManifesto = () => {
		const manifesto = document.getElementById("manifesto-section");
		if (manifesto) {
			manifesto.scrollIntoView({ behavior: "smooth" });
		}
	};

	const FooterLink = ({
		label,
		onClick,
		isActive,
	}: {
		label: string;
		onClick: () => void;
		isActive?: boolean;
	}) => (
		<button
			onClick={onClick}
			className="group flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-white transition-colors"
		>
			<div
				className={`w-2 h-2 border border-neutral-600 transition-colors ${isActive ? "bg-[#FF4D00] border-[#FF4D00]" : "group-hover:bg-[#FF4D00] group-hover:border-[#FF4D00]"}`}
			/>
			<span className={isActive ? "text-white" : ""}>{label}</span>
		</button>
	);

	return (
		<>
			<SmoothScroll />
			<CustomCursor />
			<BootSequence onComplete={() => setIsBooted(true)} />
			<SystemOverlay
				activeOverlay={activeOverlay}
				onClose={() => setActiveOverlay(null)}
			/>

			{isBooted ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1 }}
					className="dark min-h-dvh bg-[#f4f4f0] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-50 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col relative"
				>
					{/* Reactive Background Grid */}
					<ReactiveGrid />

					{/* Header */}
					<header className="relative z-10 flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 px-6 md:px-12 pt-4 md:pt-8 pb-3 md:pb-4">
						<div className="flex flex-col gap-1">
							<h1 className="sr-only">Studio+233: AI-Native Creative Suite</h1>
							<GlitchHeader />
							<p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-2 hidden md:block">
								The AI-Native Creative Suite for High-Volume Production
							</p>
						</div>
						<div className="text-right hidden md:flex flex-col items-end gap-4">
							<div className="flex items-center gap-4">
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
					<div id="manifesto-section">
						<ManifestoGSAP />
					</div>

					{/* Infinite Archive Tunnel */}
					<InfiniteArchive />

					{/* Product Hologram (Replaces NavigatorPrompt) */}
					<DeconstructedUI />

					{/* Footer */}
					<footer className="relative z-30 flex flex-col justify-end border-t border-neutral-200 dark:border-neutral-800 pt-0 shrink-0 min-h-[40vh] bg-[#f4f4f0] dark:bg-[#0a0a0a] pb-8">
						{/* Industrial Launch Footer */}
						<LaunchKeyFooter />

						<div className="flex flex-col md:flex-row justify-between items-end gap-4 text-xs font-mono text-neutral-500 uppercase mb-2 px-6 md:px-12 py-4 border-t border-neutral-800">
							<div className="flex gap-4">
								<span>© 2025</span>
								<span>■ Studio+233 Systems</span>
							</div>

							<div className="flex flex-wrap gap-8 items-center">
								<FooterLink
									label="Modules"
									onClick={() => setActiveOverlay("modules")}
									isActive={activeOverlay === "modules"}
								/>
								<FooterLink
									label="Pricing"
									onClick={() => setActiveOverlay("pricing")}
									isActive={activeOverlay === "pricing"}
								/>
								<FooterLink
									label="Manifesto"
									onClick={() => setActiveOverlay("manifesto")}
									isActive={activeOverlay === "manifesto"}
								/>
								<FooterLink
									label="Protocols"
									onClick={() => setActiveOverlay("protocols")}
									isActive={activeOverlay === "protocols"}
								/>
							</div>
						</div>
					</footer>

					{/* Data Ticker */}
					<DataTicker />
				</motion.div>
			) : null}
		</>
	);
}
