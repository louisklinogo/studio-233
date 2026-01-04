"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { BootSequence } from "@/components/landing/BootSequence";
import { InfiniteArchive } from "@/components/landing/InfiniteArchive";
import {
	InfiniteCanvas,
	type InfiniteCanvasHandle,
} from "@/components/landing/InfiniteCanvas";
import {
	KineticTrack,
	type KineticTrackHandle,
} from "@/components/landing/KineticTrack";
import { LaunchKeyFooter } from "@/components/landing/LaunchKeyFooter";
import { ProductionEngine } from "@/components/landing/ProductionEngine";
import { SystemHUD } from "@/components/landing/SystemHUD";
import { VortexContainer } from "@/components/landing/VortexContainer";
import {
	type VortexHeroHandle,
	VortexHeroV2,
} from "@/components/landing/VortexHeroV2";
import { VortexLocomotive } from "@/components/landing/VortexLocomotive";
import { CustomCursor } from "@/components/ui/CustomCursor";

export default function VortexPage() {
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(true);
	const heroRef = useRef<VortexHeroHandle>(null);
	const trackRef = useRef<KineticTrackHandle>(null);
	const canvasRef = useRef<InfiniteCanvasHandle>(null);
	const archiveScrollProgress = useRef(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<VortexLocomotive>
			<CustomCursor />
			<SystemHUD />

			<AnimatePresence mode="wait">
				{loading && <BootSequence onComplete={() => setLoading(false)} />}
			</AnimatePresence>

			<motion.div className="min-h-dvh bg-background text-foreground font-sans selection:bg-[#D81E05] selection:text-white relative">
				<VortexContainer
					heroRef={heroRef}
					trackRef={trackRef}
					canvasRef={canvasRef}
					archiveScrollProgress={archiveScrollProgress}
				>
					<VortexHeroV2 ref={heroRef} />

					<div className="engine-layer absolute inset-0 opacity-0 pointer-events-none">
						<ProductionEngine />
					</div>

					<div className="archive-layer absolute inset-0 opacity-0 pointer-events-none">
						<InfiniteArchive manualScrollProgress={archiveScrollProgress} />
					</div>

					<div className="canvas-layer absolute inset-0 opacity-0 pointer-events-none">
						<InfiniteCanvas ref={canvasRef} />
					</div>

					<div className="footer-layer absolute inset-0 opacity-0 pointer-events-none">
						<LaunchKeyFooter />
					</div>

					<KineticTrack ref={trackRef} />
				</VortexContainer>
			</motion.div>
		</VortexLocomotive>
	);
}
