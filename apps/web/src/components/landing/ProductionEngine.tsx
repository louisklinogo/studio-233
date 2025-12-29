"use client";

import { motion } from "framer-motion";
import {
	Activity,
	ArrowRight,
	CornerDownRight,
	Maximize2,
	Play,
	Settings2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

// --- Types & Constants ---
type NodeType = "input" | "process" | "gen" | "output";
type NodeStatus = "idle" | "active" | "processing" | "completed";

interface NodeData {
	id: string;
	type: NodeType;
	label: string;
	subLabel: string;
	x: number;
	y: number;
	width: number;
	height: number;
	icon: React.ElementType;
	metrics: { label: string; value: string }[];
}

interface Connection {
	id: string;
	sourceId: string;
	targetId: string;
}

const CANVAS_CENTER_X = 800;
const CANVAS_CENTER_Y = 400;

// The "Batch Asset Refinery" Schematic
const CIRCUIT_NODES: NodeData[] = [
	{
		id: "node-input",
		type: "input",
		label: "RAW_BATCH_INGEST",
		subLabel: "INPUT_SOURCE",
		x: 200,
		y: 400,
		width: 200,
		height: 110,
		icon: SwissIcons.File,
		metrics: [
			{ label: "QUEUE", value: "124_ITEMS" },
			{ label: "SOURCE", value: "S3_BUCKET" },
		],
	},
	{
		id: "node-vision",
		type: "process",
		label: "MATTE_EXTRACT",
		subLabel: "VISION_V2",
		x: 500,
		y: 300,
		width: 200,
		height: 110,
		icon: SwissIcons.Scissors,
		metrics: [
			{ label: "MASK_ALPHA", value: "1.0" },
			{ label: "CONFIDENCE", value: "99.9%" },
		],
	},
	{
		id: "node-flux",
		type: "gen",
		label: "SCENE_COMPOSITE",
		subLabel: "FLUX_GEN",
		x: 500,
		y: 500,
		width: 200,
		height: 110,
		icon: SwissIcons.Image,
		metrics: [
			{ label: "SEED", value: "4923012" },
			{ label: "LORA", value: "PROD_V2" },
		],
	},
	{
		id: "node-sora",
		type: "gen",
		label: "MOTION_SYNTH",
		subLabel: "SORA_VIDEO",
		x: 800,
		y: 400,
		width: 220,
		height: 140,
		icon: SwissIcons.Video,
		metrics: [
			{ label: "FPS", value: "60" },
			{ label: "MODEL", value: "TURBO_MAX" },
		],
	},
];

const CIRCUIT_CONNECTIONS: Connection[] = [
	{ id: "c1", sourceId: "node-input", targetId: "node-vision" },
	{ id: "c2", sourceId: "node-input", targetId: "node-flux" },
	{ id: "c3", sourceId: "node-vision", targetId: "node-sora" },
	{ id: "c4", sourceId: "node-flux", targetId: "node-sora" },
];

enum AnimationState {
	IDLE = "IDLE",
	TYPING = "TYPING",
	SUBSTRATE_REVEAL = "SUBSTRATE_REVEAL",
	PROCESSING = "PROCESSING",
	COMPLETE = "COMPLETE",
}

// --- Sub-Components ---

const GeneratedProduct: React.FC<{
	stage: "wireframe" | "render" | "motion";
	opacity: number;
}> = ({ stage, opacity }) => {
	const isWireframe = stage === "wireframe";
	const isMotion = stage === "motion";

	return (
		<div
			className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-sm bg-[#050505]"
			style={{ opacity }}
		>
			{/* Wireframe Grid */}
			<div
				className={`absolute inset-0 transition-opacity duration-700 ${isWireframe ? "opacity-40" : "opacity-10"}`}
				style={{
					backgroundImage:
						"linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
					backgroundSize: "10px 10px",
				}}
			/>

			{/* The Product (Abstract Shape) */}
			<div
				className={`
            w-32 h-20 border-2 relative transition-all duration-1000 ease-out flex items-center justify-center
            ${isWireframe ? "border-neutral-700 bg-transparent" : "border-[#FF4D00] bg-[#1a1a1a]"}
            ${isMotion ? "scale-110 shadow-[0_0_30px_rgba(255,77,0,0.3)]" : "scale-100"}
        `}
			>
				{isMotion && (
					<div className="absolute inset-0 bg-[#FF4D00]/10 animate-pulse" />
				)}
				<div className="text-[9px] font-mono text-neutral-500 tracking-widest">
					{isWireframe
						? "MESH_BUILD"
						: isMotion
							? "RENDERING..."
							: "STATIC_MESH"}
				</div>
			</div>
		</div>
	);
};

// --- Main Component ---

export const ProductionEngine: React.FC = () => {
	const [animState, setAnimState] = useState<AnimationState>(
		AnimationState.IDLE,
	);
	const [activePacket, setActivePacket] = useState<string | null>(null);
	const [promptText, setPromptText] = useState("");
	const [productStage, setProductStage] = useState<
		"wireframe" | "render" | "motion"
	>("wireframe");
	const [camera, setCamera] = useState({
		x: CANVAS_CENTER_X,
		y: CANVAS_CENTER_Y,
		zoom: 0.8,
	});
	const [showInput, setShowInput] = useState(true);
	const [passIndex, setPassIndex] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const sequenceTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		const runSequence = () => {
			// Reset
			setPromptText("");
			setShowInput(true);
			setAnimState(AnimationState.IDLE);
			setProductStage("wireframe");
			setActivePacket(null);
			setCamera({ x: 500, y: 400, zoom: 0.65 }); // Start zoomed out slightly

			// 1. Typing
			setTimeout(() => {
				setAnimState(AnimationState.TYPING);
				typewriter(
					"Ingest Summer_24 raw shoot, remove backgrounds, render social loops.",
					0,
					() => {
						// 2. Submit & Transition
						setTimeout(() => {
							setShowInput(false);
							setAnimState(AnimationState.SUBSTRATE_REVEAL);
							// Zoom into the schematic (Centered)
							setCamera({ x: 500, y: 400, zoom: 1.0 });

							// 3. Processing Flow
							setTimeout(() => {
								setAnimState(AnimationState.PROCESSING);
								runDataFlow();

								// 4. Result
								setTimeout(() => {
									setAnimState(AnimationState.COMPLETE);
									setProductStage("motion");

									// Loop back
									sequenceTimeoutRef.current = window.setTimeout(
										runSequence,
										5000,
									);
								}, 4000);
							}, 1000);
						}, 800);
					},
				);
			}, 1000);
		};

		const initialDelay = setTimeout(runSequence, 100);
		return () => {
			clearTimeout(initialDelay);
			if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
		};
	}, []);

	const typewriter = (text: string, i: number, callback: () => void) => {
		if (i < text.length) {
			setPromptText(text.substring(0, i + 1));
			setTimeout(
				() => typewriter(text, i + 1, callback),
				20 + Math.random() * 20,
			);
		} else {
			callback();
		}
	};

	const runDataFlow = () => {
		// Stage 1: Input -> Vision/Flux
		setActivePacket("stage-1");
		setTimeout(() => {
			// Stage 2: Vision/Flux -> Sora
			setActivePacket("stage-2");
			setProductStage("render");
		}, 1500);
		setTimeout(() => {
			setActivePacket(null);
		}, 3000);
	};

	const getConnectorPath = (source: NodeData, target: NodeData) => {
		const startX = source.x + source.width / 2;
		const startY = source.y;
		const endX = target.x - target.width / 2;
		const endY = target.y;
		const midX = (startX + endX) / 2;
		// M = Move, L = Line
		return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
	};

	return (
		<div
			ref={containerRef}
			className="relative w-full h-full bg-[#f4f4f0] overflow-hidden font-sans select-none"
		>
			{/* --- Header --- */}
			<div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-20 pointer-events-none">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${animState === AnimationState.PROCESSING ? "bg-[#FF4D00] animate-pulse" : "bg-neutral-300"}`}
						/>
						<span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
							Refinery_Protocol_v3
						</span>
					</div>
				</div>
			</div>

			{/* --- Substrate Layer (SVG) --- */}
			<svg className="w-full h-full absolute inset-0 z-0">
				<defs>
					<pattern
						id="grid-prod"
						width="40"
						height="40"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 40 0 L 0 0 0 40"
							fill="none"
							stroke="#e5e5e5"
							strokeWidth="1"
						/>
					</pattern>
				</defs>
				<g
					style={{
						transform: `translate(50%, 50%) scale(${camera.zoom}) translate(${-camera.x}px, ${-camera.y}px)`,
						transition: "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
					}}
				>
					<rect
						x={-2000}
						y={-2000}
						width={6000}
						height={6000}
						fill="url(#grid-prod)"
						opacity={0.6}
					/>

					{/* Connections */}
					{CIRCUIT_CONNECTIONS.map((conn) => {
						const source = CIRCUIT_NODES.find((n) => n.id === conn.sourceId)!;
						const target = CIRCUIT_NODES.find((n) => n.id === conn.targetId)!;
						const path = getConnectorPath(source, target);
						return (
							<g key={conn.id}>
								<path d={path} fill="none" stroke="#d4d4d4" strokeWidth="2" />
								{activePacket && (
									<path
										d={path}
										fill="none"
										stroke="#FF4D00"
										strokeWidth="2"
										strokeDasharray="10 10"
									>
										<animate
											attributeName="stroke-dashoffset"
											from="100"
											to="0"
											dur="0.5s"
											repeatCount="indefinite"
										/>
									</path>
								)}
							</g>
						);
					})}

					{/* Nodes */}
					{CIRCUIT_NODES.map((node) => {
						const isActive =
							(activePacket === "stage-1" &&
								["node-input"].includes(node.id)) ||
							(activePacket === "stage-1" &&
								["node-vision", "node-flux"].includes(node.id)) || // Packet arriving
							(activePacket === "stage-2" && ["node-sora"].includes(node.id)); // Packet arriving

						return (
							<g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
								<foreignObject
									x={-node.width / 2}
									y={-node.height / 2}
									width={node.width}
									height={node.height}
								>
									<div
										className={`
                                    w-full h-full bg-white border flex flex-col overflow-hidden rounded-sm transition-all duration-300
                                    ${isActive ? "border-[#FF4D00] shadow-lg scale-105" : "border-neutral-300"}
                                `}
									>
										<div
											className={`h-6 px-3 flex items-center justify-between border-b ${isActive ? "bg-[#FF4D00] text-white border-[#FF4D00]" : "bg-neutral-50 text-neutral-500 border-neutral-200"}`}
										>
											<span className="text-[8px] font-mono tracking-wider">
												{node.subLabel}
											</span>
											{isActive && (
												<Activity size={10} className="animate-spin" />
											)}
										</div>
										<div className="flex-1 p-3 flex flex-col justify-between relative">
											<div className="flex items-center gap-2">
												<node.icon size={16} className="text-neutral-500" />
												<span className="text-[10px] font-bold text-neutral-800">
													{node.label}
												</span>
											</div>
											<div className="grid grid-cols-1 gap-1">
												{node.metrics.map((m) => (
													<div
														key={m.label}
														className="flex justify-between items-baseline"
													>
														<span className="text-[7px] font-mono text-neutral-400">
															{m.label}
														</span>
														<span className="text-[8px] font-mono text-neutral-700">
															{m.value}
														</span>
													</div>
												))}
											</div>
											{node.id === "node-sora" && (
												<div className="absolute inset-0 bg-white z-10 border-t border-neutral-100">
													<GeneratedProduct
														stage={productStage}
														opacity={productStage === "wireframe" ? 0.5 : 1}
													/>
												</div>
											)}
										</div>
									</div>
								</foreignObject>
							</g>
						);
					})}
				</g>
			</svg>

			{/* --- Input UI (The Trigger) --- */}
			<div
				className={`
            absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg transition-all duration-500
            ${showInput ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}
        `}
			>
				<div className="bg-white/90 backdrop-blur border border-neutral-200 shadow-2xl rounded-sm p-2 flex items-center gap-3">
					<div className="pl-3 text-neutral-300">
						<CornerDownRight size={18} />
					</div>
					<div className="flex-1 font-mono text-xs text-neutral-600 truncate">
						{promptText}
					</div>
					<div className="w-8 h-8 bg-neutral-100 flex items-center justify-center rounded-sm">
						<ArrowRight size={14} className="text-neutral-400" />
					</div>
				</div>
			</div>
		</div>
	);
};
