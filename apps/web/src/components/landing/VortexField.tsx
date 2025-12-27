"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

const VortexFieldCanvas = dynamic(
	() => import("./VortexFieldCanvas").then((mod) => mod.VortexFieldCanvas),
	{ ssr: false },
);

export const VortexField: React.FC = () => {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const [camera, setCamera] = useState({ x: 0, y: 0, scale: 0.8 });
	const containerRef = useRef<HTMLDivElement>(null);

	// Automated panning simulation for the "Manual" feel
	useEffect(() => {
		if (!mounted) return;
		let frame: number;
		const animate = (time: number) => {
			setCamera((prev) => ({
				...prev,
				x: Math.sin(time / 2000) * 100,
				y: Math.cos(time / 3000) * 50,
			}));
			frame = requestAnimationFrame(animate);
		};
		frame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frame);
	}, [mounted]);

	if (!mounted) return <div className="h-screen w-full bg-[#f4f4f0]" />;

	return (
		<div ref={containerRef} className="relative w-full h-[200vh] bg-[#f4f4f0]">
			<div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
				{/* The Infinite Canvas (Konva) */}
				<VortexFieldCanvas camera={camera} />

				{/* Spatial HUD Overlay */}
				<div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-12">
					<div className="flex justify-between items-start">
						<div className="flex flex-col gap-2">
							<span className="font-mono text-[9px] text-[#FF4D00] tracking-[0.3em] font-bold uppercase transition-all">
								FIELD_STUDY_STAGE_03
							</span>
							<span className="font-mono text-[8px] text-neutral-400">
								COORDINATE_SYSTEM: EUCLIDEAN_INFINITE
							</span>
						</div>
						<div className="flex flex-col gap-1 items-end font-mono text-[9px] text-neutral-500">
							<span>CAM_X: {camera.x.toFixed(2)}</span>
							<span>CAM_Y: {camera.y.toFixed(2)}</span>
							<span>MAG: {(camera.scale * 100).toFixed(0)}%</span>
						</div>
					</div>

					<div className="flex justify-between items-end">
						<div className="w-48 h-48 border border-neutral-200 flex flex-col p-4 gap-4 bg-white/50 backdrop-blur-sm">
							<span className="font-mono text-[8px] text-[#FF4D00] font-bold">
								MINIMAP_PRISM
							</span>
							<div className="flex-1 bg-neutral-100 relative overflow-hidden">
								<motion.div
									animate={{ x: camera.x / 10, y: camera.y / 10 }}
									className="absolute top-1/2 left-1/2 w-4 h-6 border border-[#FF4D00] bg-white shadow-sm"
								/>
							</div>
						</div>
						<div className="font-mono text-[7vw] font-black text-black/5 tracking-tighter uppercase select-none">
							Spatial
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
