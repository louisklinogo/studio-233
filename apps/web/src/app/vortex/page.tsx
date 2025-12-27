"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
	KineticTrack,
	type KineticTrackHandle,
} from "@/components/landing/KineticTrack";
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
	const heroRef = useRef<VortexHeroHandle>(null);
	const trackRef = useRef<KineticTrackHandle>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<VortexLenis>
			<CustomCursor />

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.5 }}
				className="min-h-dvh bg-[#f4f4f0] text-neutral-50 font-sans selection:bg-[#D81E05] selection:text-white relative"
			>
				{/* The Unified Kinetic Stream Container */}
				<VortexContainer heroRef={heroRef} trackRef={trackRef}>
					<VortexHeroV2 ref={heroRef} />
					<KineticTrack ref={trackRef} />
				</VortexContainer>
			</motion.div>
		</VortexLenis>
	);
}
