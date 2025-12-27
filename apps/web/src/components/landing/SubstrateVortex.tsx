"use client";

import { Background, Handle, Position, ReactFlow } from "@xyflow/react";
import React, { useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { motion, useScroll, useTransform } from "framer-motion";
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
		data: { label: "CLIP_MODEL_V2", category: "process", status: "running" },
	},
	{
		id: "process2",
		type: "standard",
		position: { x: 300, y: 250 },
		data: { label: "NEURAL_SAMPLER", category: "process", status: "idle" },
	},
	{
		id: "output",
		type: "standard",
		position: { x: 550, y: 150 },
		data: { label: "MATERIAL_DECODER", category: "output", status: "idle" },
	},
];

const initialEdges = [
	{ id: "e1-1", source: "trigger", target: "process1", animated: true },
	{ id: "e1-2", source: "trigger", target: "process2", animated: true },
	{ id: "e2-1", source: "process1", target: "output", animated: false },
	{ id: "e2-2", source: "process2", target: "output", animated: false },
];

export const SubstrateVortex: React.FC = () => {
	const [mounted, setMounted] = useState(false);
	const { scrollYProgress } = useScroll();

	const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
	const scale = useTransform(scrollYProgress, [0.2, 0.6], [0.8, 1.1]);
	const flowOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return <div className="absolute inset-0 bg-[#050505]" />;

	return (
		<motion.div
			style={{ opacity, scale }}
			className="absolute inset-0 flex items-center justify-center bg-[#050505]"
		>
			<motion.div
				style={{ opacity: flowOpacity }}
				className="w-full h-full pointer-events-none"
			>
				<ReactFlow
					nodes={initialNodes}
					edges={initialEdges}
					nodeTypes={nodeTypes}
					fitView
					proOptions={{ hideAttribution: true }}
					style={{ background: "transparent" }}
				>
					<Background color="#1a1a1a" gap={40} size={1} />
				</ReactFlow>
			</motion.div>

			{/* Bulk Processing Visualizer Overlay */}
			<div className="absolute inset-0 pointer-events-none z-20">
				{/* High-frequency status pulses and synchronized progress bars */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-12 opacity-30">
					<div className="flex justify-between items-center mb-12">
						<div className="font-mono text-[10px] text-[#FF4D00] tracking-widest animate-pulse">
							BULK_PROG_SYNC: [||||||||||||||||||||||||||||||] 84%
						</div>
						<div className="font-mono text-[10px] text-neutral-600">
							THROUGHPUT: 1.2 GB/S
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
