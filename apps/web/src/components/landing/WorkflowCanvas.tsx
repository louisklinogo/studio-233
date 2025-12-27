"use client";

import {
	Activity,
	Command,
	Cpu,
	ImageIcon,
	Layers,
	Sliders,
	Zap,
} from "lucide-react";
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

// --- Types & Constants ---
export interface NodeData {
	id: string;
	label: string;
	subLabel: string;
	type: "input" | "process" | "output";
	x: number;
	y: number;
	width: number;
	height: number;
	metrics: { label: string; value: string }[];
}

const CIRCUIT_NODES: NodeData[] = [
	{
		id: "node-prompt",
		label: "INPUT_ENCODER",
		subLabel: "PROMPT_TRANSFORM",
		type: "input",
		x: 150,
		y: 150,
		width: 180,
		height: 100,
		metrics: [
			{ label: "Latent", value: "768d" },
			{ label: "Token", value: "Active" },
		],
	},
	{
		id: "node-clip",
		label: "CLIP_MODEL_V2",
		subLabel: "SEMANTIC_ALIGN",
		type: "process",
		x: 450,
		y: 150,
		width: 180,
		height: 100,
		metrics: [
			{ label: "Score", value: "0.992" },
			{ label: "Version", value: "3.5" },
		],
	},
	{
		id: "node-ksampler",
		label: "NEURAL_SAMPLER",
		subLabel: "DIFFUSION_LOOP",
		type: "process",
		x: 750,
		y: 150,
		width: 180,
		height: 100,
		metrics: [
			{ label: "Steps", value: "32" },
			{ label: "Cfg", value: "7.5" },
		],
	},
	{
		id: "node-output",
		label: "RENDER_ENGINE",
		subLabel: "FINAL_ASSEMBLY",
		type: "output",
		x: 1050,
		y: 150,
		width: 220,
		height: 160,
		metrics: [
			{ label: "Resolution", value: "4K" },
			{ label: "Format", value: "HEIF" },
		],
	},
];

const CIRCUIT_CONNECTIONS = [
	{ id: "c1", sourceId: "node-prompt", targetId: "node-clip" },
	{ id: "c2", sourceId: "node-clip", targetId: "node-ksampler" },
	{ id: "c3", sourceId: "node-ksampler", targetId: "node-output" },
];

// --- Specialized Product View ---
export const GeneratedProduct: React.FC<{
	stage: "empty" | "wireframe" | "render" | "edited";
	opacity: number;
}> = ({ stage, opacity }) => {
	const isWireframe = stage === "wireframe";
	const isDark = stage === "edited";

	return (
		<div
			className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 bg-white"
			style={{ opacity }}
		>
			<div
				className={`
            w-36 h-28 rounded-sm border relative transition-all duration-1000 ease-out flex overflow-hidden shadow-2xl
            ${
							isWireframe
								? "border-neutral-200 bg-transparent"
								: isDark
									? "border-neutral-800 bg-[#121212]"
									: "border-neutral-100 bg-[#eeeeee]"
						}
        `}
			>
				{/* Control Panel (Dials) */}
				<div
					className={`w-14 h-full border-r flex flex-col items-center justify-center gap-4 ${isDark ? "border-neutral-800" : "border-neutral-200"}`}
				>
					<div
						className={`w-8 h-8 rounded-full border relative ${isDark ? "border-neutral-700 bg-[#1a1a1a]" : "border-neutral-300 bg-white"}`}
					>
						<div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#FF4400]"></div>
					</div>
					<div
						className={`w-6 h-6 rounded-full border relative ${isDark ? "border-neutral-700 bg-[#1a1a1a]" : "border-neutral-300 bg-white"}`}
					>
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[1px] bg-neutral-400 rotate-45"></div>
					</div>
				</div>

				{/* Speaker Grill */}
				<div className="flex-1 grid grid-cols-5 gap-1.5 p-4 content-center opacity-80">
					{Array.from({ length: 30 }).map((_, i) => (
						<div
							key={i}
							className={`w-1 h-1 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-300"}`}
						></div>
					))}
				</div>

				{/* Wireframe overlay */}
				{isWireframe && (
					<div className="absolute inset-0 border border-[#FF4400]/20 pointer-events-none">
						<div className="absolute top-1/2 left-0 right-0 h-px bg-[#FF4400]/10"></div>
						<div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#FF4400]/10"></div>
					</div>
				)}
			</div>
			<div className="mt-3 flex items-center gap-2">
				<span
					className={`w-1 h-1 rounded-full animate-pulse ${isDark ? "bg-[#FF4400]" : "bg-[#FF4400]"}`}
				></span>
				<span className="text-[7px] font-mono text-neutral-400 tracking-[0.3em] uppercase font-bold">
					{stage === "wireframe"
						? "Calculating_Inference..."
						: stage === "render"
							? "Output_Resolved"
							: "Material_Shift_Final"}
				</span>
			</div>
		</div>
	);
};

// --- Main Canvas ---
export const WorkflowCanvas = forwardRef((props, ref) => {
	const [productStage, setProductStage] = useState<
		"empty" | "wireframe" | "render" | "edited"
	>("empty");
	const [activePacket, setActivePacket] = useState<string | null>(null);
	const [zoom, setZoom] = useState(1);
	const [camera, setCamera] = useState({ x: 600, y: 150 });

	// Expose controls for GSAP orchestration later
	useImperativeHandle(ref, () => ({
		setProductStage,
		setActivePacket,
		setZoom,
		setCamera,
	}));

	const getConnectorPath = (source: NodeData, target: NodeData) => {
		const startX = source.x + source.width / 2;
		const startY = source.y;
		const endX = target.x - target.width / 2;
		const endY = target.y;
		const midX = (startX + endX) / 2;
		return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
	};

	return (
		<div className="w-full h-full relative overflow-hidden bg-[#fbfbfb] select-none">
			<svg className="w-full h-full absolute inset-0">
				<defs>
					<pattern
						id="canvas-grid"
						width="40"
						height="40"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 40 0 L 0 0 0 40"
							fill="none"
							stroke="#f0f0f0"
							strokeWidth="1"
						/>
					</pattern>
				</defs>

				<g
					style={{
						transform: `translate(50%, 50%) scale(${zoom}) translate(${-camera.x}px, ${-camera.y}px)`,
						transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
					}}
				>
					<rect
						x={-2000}
						y={-2000}
						width={4000}
						height={4000}
						fill="url(#canvas-grid)"
					/>

					{/* Connections */}
					{CIRCUIT_CONNECTIONS.map((conn) => {
						const source = CIRCUIT_NODES.find((n) => n.id === conn.sourceId)!;
						const target = CIRCUIT_NODES.find((n) => n.id === conn.targetId)!;
						return (
							<path
								key={conn.id}
								d={getConnectorPath(source, target)}
								fill="none"
								stroke="#e5e5e5"
								strokeWidth="2"
							/>
						);
					})}

					{/* Nodes */}
					{CIRCUIT_NODES.map((node) => (
						<g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
							<foreignObject
								x={-node.width / 2}
								y={-node.height / 2}
								width={node.width}
								height={node.height}
								className="overflow-visible"
							>
								<div
									className={`
                            w-full h-full bg-white border border-neutral-200 rounded-sm flex flex-col shadow-sm transition-all duration-300
                            ${activePacket === node.id ? "border-[#FF4400] shadow-md" : ""}
                        `}
								>
									{/* Header */}
									<div
										className={`
                                h-5 px-2 flex items-center justify-between border-b text-[8px] font-mono tracking-widest
                                ${activePacket === node.id ? "bg-[#FF4400] text-white" : "bg-neutral-50 text-neutral-400"}
                            `}
									>
										<span>{node.subLabel}</span>
										{activePacket === node.id && (
											<Activity size={10} className="animate-spin" />
										)}
									</div>

									{/* Body */}
									<div className="flex-1 p-3 relative flex flex-col">
										<div className="flex items-center gap-2 mb-2">
											{node.type === "input" && (
												<Zap size={12} className="text-[#FF4400]" />
											)}
											{node.type === "process" && (
												<Cpu size={12} className="text-neutral-400" />
											)}
											<span className="font-bold text-[10px] text-[#1a1a1a] uppercase tracking-tight">
												{node.label}
											</span>
										</div>
										<div className="grid grid-cols-2 gap-1 mt-auto">
											{node.metrics.map((m) => (
												<div key={m.label} className="flex flex-col">
													<span className="text-[7px] text-neutral-400 font-mono leading-none">
														{m.label}
													</span>
													<span className="text-[9px] font-mono text-[#1a1a1a]">
														{m.value}
													</span>
												</div>
											))}
										</div>

										{node.type === "output" && (
											<div className="absolute inset-0 bg-white">
												<GeneratedProduct
													stage={productStage}
													opacity={productStage === "empty" ? 0 : 1}
												/>
											</div>
										)}
									</div>
								</div>
							</foreignObject>
						</g>
					))}
				</g>
			</svg>

			{/* Surface Overlays (Act II Meta) */}
			<div className="absolute bottom-6 left-6 flex items-center gap-4 pointer-events-none">
				<div className="flex flex-col">
					<span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest">
						Buffer_Load
					</span>
					<div className="w-24 h-[2px] bg-neutral-100 mt-1 relative overflow-hidden">
						<div className="absolute inset-0 bg-[#FF4400] w-2/3" />
					</div>
				</div>
				<div className="h-4 w-[1px] bg-neutral-200" />
				<span className="text-[9px] font-mono text-[#1a1a1a] font-bold">
					MODE: SCHEMATIC_INFERENCE
				</span>
			</div>
		</div>
	);
});

WorkflowCanvas.displayName = "WorkflowCanvas";
