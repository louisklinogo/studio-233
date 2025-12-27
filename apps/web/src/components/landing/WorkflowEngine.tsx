"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { WorkflowCanvas, WorkflowCanvasHandle } from "./WorkflowCanvas";

export interface WorkflowEngineHandle {
	container: HTMLDivElement | null;
	canvas: WorkflowCanvasHandle | null;
}

/**
 * WorkflowEngine - Act II: The Substrate Logic
 * An industrial-styled container for the node-graph visualization.
 */
export const WorkflowEngine = forwardRef<WorkflowEngineHandle, {}>(
	(props, ref) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const canvasRef = useRef<WorkflowCanvasHandle>(null);

		useImperativeHandle(ref, () => ({
			container: containerRef.current,
			canvas: canvasRef.current,
		}));

		return (
			<section
				ref={containerRef}
				className="absolute inset-0 w-full h-screen bg-transparent overflow-hidden flex flex-col items-center justify-center p-8 lg:p-24 opacity-0 pointer-events-none scale-150"
			>
				{/* Section Metadata Headers (V2 Style) */}
				<div className="absolute top-12 left-12 flex flex-col z-20">
					<div className="flex items-center gap-2 mb-1">
						<div className="w-2 h-2 bg-[#FF4400]"></div>
						<span className="text-[10px] font-mono text-[#1a1a1a] uppercase tracking-[0.5em] font-bold">
							Logic_Schematic
						</span>
					</div>
					<span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest pl-4">
						SUBSTRATE_VIEW // ACT_II
					</span>
				</div>

				<div className="absolute top-12 right-12 text-right z-20">
					<span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">
						Handshake: Verified
					</span>
					<span className="text-[9px] font-mono text-[#1a1a1a] uppercase tracking-widest font-bold">
						STREAM_SYNCHRONIZED
					</span>
				</div>

				{/* The Monolith Container (The Canvas Viewport) */}
				<div className="w-full h-full max-w-[1400px] border border-neutral-200/80 shadow-[0_40px_100px_rgba(0,0,0,0.04)] rounded-sm overflow-hidden bg-transparent relative z-10 group">
					<WorkflowCanvas ref={canvasRef} />
				</div>

				{/* Industrial Annotation */}
				<div className="absolute bottom-12 right-12 max-w-xs text-right opacity-40 z-20">
					<p className="text-[9px] font-mono leading-relaxed text-neutral-500 uppercase tracking-wider">
						Warning: Manual manipulation of processing nodes may result in
						high-variance creative output. <br />
						Maintain thermal equilibrium. [02]
					</p>
				</div>

				{/* Grid Decals */}
				<div className="absolute bottom-12 left-12 flex gap-1 z-20">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="w-1.5 h-10 bg-neutral-200/60"></div>
					))}
					<div className="ml-2 flex flex-col justify-end">
						<span className="text-[8px] font-mono text-neutral-300 uppercase tracking-tighter">
							Calibration: 100%
						</span>
					</div>
				</div>
			</section>
		);
	},
);

WorkflowEngine.displayName = "WorkflowEngine";
