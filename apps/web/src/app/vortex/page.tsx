"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
	KineticTrack,
	type KineticTrackHandle,
} from "@/components/landing/KineticTrack";
import { ProductionEngine } from "@/components/landing/ProductionEngine";
import { SystemCalibrationLoader } from "@/components/landing/SystemCalibrationLoader";
import { SystemHUD } from "@/components/landing/SystemHUD";
import { VortexContainer } from "@/components/landing/VortexContainer";
import {
	type VortexHeroHandle,
	VortexHeroV2,
} from "@/components/landing/VortexHeroV2";
import { VortexLenis } from "@/components/landing/VortexLenis";
import { CustomCursor } from "@/components/ui/CustomCursor";

export default function VortexPage() {
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(true);
	const heroRef = useRef<VortexHeroHandle>(null);
	const trackRef = useRef<KineticTrackHandle>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<VortexLenis>
			<CustomCursor />

			{loading && (
				<SystemCalibrationLoader onComplete={() => setLoading(false)} />
			)}

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: loading ? 0 : 1 }}
				transition={{ duration: 1.5 }}
				className="min-h-dvh bg-[#f4f4f0] text-neutral-50 font-sans selection:bg-[#D81E05] selection:text-white relative"
			>
				{/* The Unified Kinetic Stream Container */}
				<VortexContainer heroRef={heroRef} trackRef={trackRef}>
					<VortexHeroV2 ref={heroRef} />

					{/* The Automated Batch Refinery Simulation (Background for Monolith) */}
					<div className="engine-layer absolute inset-0 opacity-0 pointer-events-none">
						<ProductionEngine />
					</div>

					<KineticTrack ref={trackRef} />
				</VortexContainer>
			</motion.div>
		</VortexLenis>
	);
}
