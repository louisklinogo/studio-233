"use client";

import {
	Background,
	ConnectionLineType,
	Handle,
	Position,
	ReactFlow,
} from "@xyflow/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { StandardNode } from "@/components/studio-workflow/nodes/StandardNode";

const nodeTypes = {
	standard: StandardNode,
};

const initialNodes = [
	{
		id: "trigger",
		type: "standard",
		position: { x: 50, y: 150 },
		data: { label: "INPUT_ENCODER", category: "input", status: "running" },
	},
	{
		id: "process1",
		type: "standard",
		position: { x: 300, y: 50 },
		data: { label: "CLIP_MODEL_V2", category: "generation", status: "running" },
	},
	{
		id: "process2",
		type: "standard",
		position: { x: 300, y: 250 },
		data: {
			label: "NEURAL_SAMPLER",
			category: "generation",
			status: "running",
		},
	},
	{
		id: "output",
		type: "standard",
		position: { x: 600, y: 150 },
		data: { label: "MATERIAL_DECODER", category: "output", status: "idle" },
	},
];

const initialEdges = [
	{
		id: "e1-1",
		source: "trigger",
		target: "process1",
		type: ConnectionLineType.Step,
		animated: true,
		style: { stroke: "#FF4D00", strokeWidth: 1 },
	},
	{
		id: "e1-2",
		source: "trigger",
		target: "process2",
		type: ConnectionLineType.Step,
		animated: true,
		style: { stroke: "#FF4D00", strokeWidth: 1 },
	},
	{
		id: "e2-1",
		source: "process1",
		target: "output",
		type: ConnectionLineType.Step,
		animated: false,
		style: { stroke: "#333", strokeWidth: 1 },
	},
	{
		id: "e2-2",
		source: "process2",
		target: "output",
		type: ConnectionLineType.Step,
		animated: false,
		style: { stroke: "#333", strokeWidth: 1 },
	},
];

export const VortexEngine: React.FC = () => {
	const [mounted, setMounted] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return <div className="h-[300vh] w-full bg-[#050505]" />;

	return (
		<div ref={containerRef} className="relative w-full h-[300vh] bg-[#050505]">
			<div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
				{/* The Substrate (XYFlow) */}
				<div className="absolute inset-0 z-0">
					<ReactFlow
						nodes={initialNodes}
						edges={initialEdges}
						nodeTypes={nodeTypes}
						fitView
						proOptions={{ hideAttribution: true }}
						style={{ background: "transparent" }}
						zoomOnScroll={false}
						panOnScroll={false}
						draggable={false}
						nodesDraggable={false}
						elementsSelectable={false}
					>
						<Background color="#111" gap={40} size={1} />
					</ReactFlow>
				</div>

				{/* Bulk Processing Visualizer Overlay */}
				<div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
					{/* Manhattan Surge Simulation (CSS Particles) */}
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						{Array.from({ length: 12 }).map((_, i) => (
							<motion.div
								key={i}
								initial={{ x: -200, opacity: 0 }}
								animate={{
									x: [null, 600],
									opacity: [0, 1, 1, 0],
									y: [
										i * 20 - 120,
										i * 20 - 120,
										i % 2 === 0 ? 100 : -100,
										i % 2 === 0 ? 100 : -100,
									],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									delay: i * 0.15,
									ease: "linear",
								}}
								className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-[#FF4D00] to-transparent blur-[2px] rotate-90"
							/>
						))}
					</div>

					{/* Technical HUD Overlay */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl px-12 opacity-80 flex flex-col gap-64">
						<div className="flex justify-between items-start">
							<div className="flex flex-col gap-2">
								<span className="font-mono text-[9px] text-[#FF4D00] tracking-[0.3em] font-bold">
									SUBSTRATE_LAYER_02
								</span>
								<span className="font-mono text-[8px] text-neutral-600">
									SCHEMATIC_MODE: ACTIVE_INFERENCE
								</span>
							</div>
							<div className="flex flex-col gap-2 items-end">
								<span className="font-mono text-[9px] text-[#FF4D00] tracking-[0.3em] font-bold animate-pulse">
									THROUGHPUT: 1.2 GB/S
								</span>
								<div className="w-32 h-[1px] bg-neutral-800 relative overflow-hidden">
									<motion.div
										animate={{ x: ["-100%", "100%"] }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: "linear",
										}}
										className="absolute inset-0 bg-[#FF4D00] w-1/2 shadow-[0_0_10px_#FF4D00]"
									/>
								</div>
							</div>
						</div>

						<div className="flex justify-between items-end">
							<div className="flex flex-col gap-2 opacity-40 hover:opacity-100 transition-opacity">
								<div className="flex gap-4 items-center uppercase font-mono text-[8px] text-white">
									<span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
									NODE_HEALTH: OPTIMAL
								</div>
								<div className="flex gap-4 items-center uppercase font-mono text-[8px] text-white">
									<span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] shadow-[0_0_5px_#FF4D00]" />
									BATCH_SIZE: 1000_SETS
								</div>
							</div>
							<div className="font-mono text-[7vw] font-black text-white/5 tracking-tighter uppercase select-none pointer-events-none">
								Production
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
