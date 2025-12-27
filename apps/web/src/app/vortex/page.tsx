import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { SystemHUD } from "@/components/landing/SystemHUD";
import { VortexContainer } from "@/components/landing/VortexContainer";
import {
	VortexHero,
	type VortexHeroHandle,
} from "@/components/landing/VortexHero";
import { VortexLenis } from "@/components/landing/VortexLenis";
import { VortexManifesto } from "@/components/landing/VortexManifesto";
import { CustomCursor } from "@/components/ui/CustomCursor";

export default function VortexPage() {
	const [mounted, setMounted] = useState(false);
	const heroRef = useRef<VortexHeroHandle>(null);

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
				{/* Act I: The Manual */}
				<VortexContainer heroRef={heroRef}>
					<VortexHero ref={heroRef} />
				</VortexContainer>

				{/* Act II: The Word (Manifesto) */}
				<VortexManifesto />

				{/* Persistent System HUD */}
				<SystemHUD />
			</motion.div>
		</VortexLenis>
	);
}
