"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

type OverlayType = "modules" | "pricing" | "protocols" | "manifesto" | null;

interface SystemOverlayProps {
	activeOverlay: OverlayType;
	onClose: () => void;
}

const CloseButton = ({ onClick }: { onClick: () => void }) => (
	<button
		onClick={onClick}
		className="group relative w-10 h-10 flex items-center justify-center border border-neutral-800 hover:border-[#FF4D00] transition-colors bg-[#0a0a0a]"
	>
		<div className="absolute inset-0 bg-[#FF4D00]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
		<div className="w-4 h-4 relative">
			<span className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-400 group-hover:bg-[#FF4D00] rotate-45 transform origin-center transition-colors" />
			<span className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-400 group-hover:bg-[#FF4D00] -rotate-45 transform origin-center transition-colors" />
		</div>
	</button>
);

export const SystemOverlay = ({
	activeOverlay,
	onClose,
}: SystemOverlayProps) => {
	// Close on Escape key
	React.useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [onClose]);

	return (
		<AnimatePresence>
			{activeOverlay && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-[60] bg-[#050505]/80 backdrop-blur-sm cursor-crosshair"
					/>

					{/* MODULES - Bottom Sheet (Blueprint Schematic) */}
					{activeOverlay === "modules" && (
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 28, stiffness: 200 }}
							className="fixed bottom-0 left-0 right-0 z-[70] h-[85vh] bg-[#0a0a0a] border-t border-neutral-800 flex flex-col"
						>
							{/* Technical Header */}
							<div className="flex items-center justify-between px-8 py-6 border-b border-neutral-800 bg-[#0f0f0f]">
								<div className="flex flex-col gap-1">
									<h2 className="text-2xl font-bold tracking-tight text-white">
										SYSTEM ARCHITECTURE
									</h2>
									<div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
										<span className="w-2 h-2 bg-emerald-500 rounded-sm animate-pulse" />
										<span>Schematic View /// V.2.0</span>
									</div>
								</div>
								<CloseButton onClick={onClose} />
							</div>

							{/* Blueprint Grid */}
							<div className="flex-1 overflow-y-auto p-8 relative bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px]">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800 max-w-7xl mx-auto">
									{[
										{
											id: "01",
											name: "NEURAL_CANVAS",
											desc: "Infinite spatial environment for node-based orchestration.",
											specs: "WEBGL 2.0 / R3F",
										},
										{
											id: "02",
											name: "AGENT_SWARM",
											desc: "Autonomous execution pipeline with multi-model routing.",
											specs: "GPT-4 / CLAUDE 3",
										},
										{
											id: "03",
											name: "ASSET_FOUNDRY",
											desc: "High-volume media generation and processing unit.",
											specs: "STABLE DIFFUSION",
										},
										{
											id: "04",
											name: "MEMORY_CORE",
											desc: "Vector database integration for long-term context.",
											specs: "PINECONE / WEAVIATE",
										},
										{
											id: "05",
											name: "BRIDGE_API",
											desc: "REST/GraphQL gateways for external integration.",
											specs: "REST / GQL",
										},
										{
											id: "06",
											name: "OBSERVER_DECK",
											desc: "Real-time analytics and telemetry visualization.",
											specs: "REALTIME STREAM",
										},
									].map((module, i) => (
										<div
											key={i}
											className="group relative bg-[#0a0a0a] p-8 min-h-[240px] flex flex-col justify-between hover:bg-[#0f0f0f] transition-colors"
										>
											{/* Corner Markers */}
											<div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-neutral-700" />
											<div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-neutral-700" />
											<div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-neutral-700" />
											<div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-neutral-700" />

											<div className="flex justify-between items-start">
												<span className="font-mono text-xs text-[#FF4D00]">
													SYS.{module.id}
												</span>
												<SwissIcons.Grid />
											</div>

											<div>
												<h3 className="text-lg font-bold text-white mb-2 tracking-tight">
													{module.name}
												</h3>
												<p className="text-sm text-neutral-400 leading-relaxed mb-4">
													{module.desc}
												</p>
												<div className="inline-block px-2 py-1 border border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase">
													{module.specs}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					)}

					{/* PRICING - Right Panel (Resource Allocator) */}
					{activeOverlay === "pricing" && (
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							className="fixed top-0 right-0 bottom-0 z-[70] w-full md:w-[520px] bg-[#0c0c0c] border-l border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
						>
							<div className="p-8 border-b border-neutral-800">
								<div className="flex items-center justify-between mb-8">
									<div className="flex flex-col">
										<span className="font-mono text-[10px] uppercase tracking-widest text-[#FF4D00] mb-1">
											Allocation Strategy
										</span>
										<h2 className="text-3xl font-bold text-white">
											RESOURCE QUOTAS
										</h2>
									</div>
									<CloseButton onClick={onClose} />
								</div>

								{/* Decorative Metric Graph */}
								<div className="h-12 flex items-end gap-1 mb-2">
									{[40, 60, 30, 80, 50, 90, 70, 45, 20, 60].map((h, i) => (
										<div
											key={i}
											className="flex-1 bg-neutral-800"
											style={{ height: `${h}%` }}
										/>
									))}
								</div>
							</div>

							<div className="flex-1 overflow-y-auto p-8 space-y-4">
								{[
									{
										name: "OPERATOR",
										price: "0",
										unit: "USD/MO",
										capacity: "10%",
										features: [
											"Single Agent Runtime",
											"Local Vector Store",
											"Community Protocols",
										],
									},
									{
										name: "STUDIO",
										price: "49",
										unit: "USD/SEAT",
										capacity: "65%",
										features: [
											"Swarm Orchestration",
											"Cloud Memory (1TB)",
											"API Gateway Access",
										],
										highlight: true,
									},
									{
										name: "ENTERPRISE",
										price: "VAR",
										unit: "CUSTOM",
										capacity: "100%",
										features: [
											"Dedicated GPU Cluster",
											"Custom Model Finetuning",
											"SLA & Audit Logs",
										],
									},
								].map((tier, i) => (
									<div
										key={i}
										className={`relative p-6 border ${tier.highlight ? "border-[#FF4D00] bg-[#FF4D00]/5" : "border-neutral-800 bg-[#111]"} hover:border-neutral-600 transition-all group`}
									>
										{/* Capacity Gauge */}
										<div className="absolute top-6 right-6 flex flex-col items-end gap-1">
											<span className="font-mono text-[10px] text-neutral-500">
												CAPACITY
											</span>
											<div className="w-24 h-1 bg-neutral-800">
												<div
													className={`h-full ${tier.highlight ? "bg-[#FF4D00]" : "bg-white"}`}
													style={{ width: tier.capacity }}
												/>
											</div>
										</div>

										<h3 className="text-xl font-bold text-white mb-1">
											{tier.name}
										</h3>
										<div className="flex items-baseline gap-2 mb-6">
											<span className="text-4xl font-mono font-light text-neutral-200">
												{tier.price}
											</span>
											<span className="text-[10px] font-mono text-neutral-500">
												{tier.unit}
											</span>
										</div>

										<ul className="space-y-3 border-t border-neutral-800/50 pt-4">
											{tier.features.map((feat, j) => (
												<li
													key={j}
													className="flex items-center gap-3 text-sm text-neutral-400 font-mono"
												>
													<div
														className={`w-1 h-1 ${tier.highlight ? "bg-[#FF4D00]" : "bg-neutral-600"}`}
													/>
													{feat}
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</motion.div>
					)}

					{/* PROTOCOLS - System Log (Microfiche Style) */}
					{activeOverlay === "protocols" && (
						<div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
							<motion.div
								initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
								animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
								exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
								className="w-full max-w-2xl bg-[#f0f0f0] text-black shadow-2xl relative overflow-hidden"
							>
								{/* Paper Texture Overlay */}
								<div
									className="absolute inset-0 opacity-[0.05] pointer-events-none"
									style={{
										backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
									}}
								/>

								{/* Header */}
								<div className="flex justify-between items-start p-8 border-b-2 border-black">
									<div className="flex flex-col gap-2">
										<h1 className="text-4xl font-black tracking-tighter uppercase">
											Protocol Log
										</h1>
										<span className="font-mono text-xs">
											DOC_REF: LEG-233-X // CLASSIFIED
										</span>
									</div>
									<button
										onClick={onClose}
										className="hover:bg-black hover:text-white transition-colors p-2 border border-black"
									>
										<div className="w-4 h-4 flex items-center justify-center">
											✕
										</div>
									</button>
								</div>

								{/* Content */}
								<div className="p-8 space-y-8 font-mono text-sm leading-relaxed">
									<div>
										<h3 className="font-bold border-b border-black mb-2 inline-block">
											01. DATA_SOVEREIGNTY
										</h3>
										<p>
											All production assets processed within Studio+233 remain
											the exclusive property of the Operator. No data is
											ingested for foundation model training without explicit,
											written cryptographic consent.
										</p>
									</div>
									<div>
										<h3 className="font-bold border-b border-black mb-2 inline-block">
											02. SYSTEM_USAGE
										</h3>
										<p>
											By initializing the System, the Operator agrees to the
											Standard License Agreement (SOLA-2025). Unauthorized
											redistribution, reverse engineering, or probing of core
											agent swarms is strictly prohibited.
										</p>
									</div>

									<div className="pt-8 mt-8 border-t border-black flex justify-between items-end opacity-60">
										<div className="w-24 h-24 border border-black flex items-center justify-center">
											<span className="text-[10px] -rotate-45">
												OFFICIAL
												<br />
												SEAL
											</span>
										</div>
										<div className="text-right">
											<p>SIGNED: ____________________</p>
											<p className="mt-2">DATE: 2025-12-17</p>
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					)}

					{/* MANIFESTO - The Black Monolith (Typographic) */}
					{activeOverlay === "manifesto" && (
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 50 }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							className="fixed inset-0 z-[70] bg-[#000] text-[#e5e5e5] overflow-y-auto"
						>
							<div className="min-h-full flex flex-col items-center justify-center p-8 md:p-24 relative">
								{/* Close Trigger (Top Right) */}
								<button
									onClick={onClose}
									className="fixed top-8 right-8 z-50 text-neutral-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest mix-blend-difference"
								>
									[ Close Manifesto ]
								</button>

								{/* Content Container */}
								<div className="max-w-3xl w-full flex flex-col gap-24">
									{/* Header */}
									<div className="flex flex-col gap-6 border-l-2 border-[#FF4D00] pl-8">
										<span className="font-mono text-[#FF4D00] text-sm tracking-widest">
											TENETS OF THE NEW CREATIVE OS
										</span>
										<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]">
											THE AGE OF
											<br />
											<span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-600">
												INDUSTRIAL IMAGINATION.
											</span>
										</h1>
									</div>

									{/* Principles Grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-16">
										<div className="flex flex-col gap-4">
											<div className="font-mono text-xs text-neutral-500">
												01 /// SCALE
											</div>
											<h3 className="text-2xl font-bold text-white">
												Beyond the One-Off.
											</h3>
											<p className="text-neutral-400 leading-relaxed font-serif text-lg">
												We reject the limitations of single-file creation. True
												production requires orchestration. A system that
												generates not one, but one thousand variations with the
												same fidelity as the first.
											</p>
										</div>

										<div className="flex flex-col gap-4">
											<div className="font-mono text-xs text-neutral-500">
												02 /// AGENCY
											</div>
											<h3 className="text-2xl font-bold text-white">
												Tools That Think.
											</h3>
											<p className="text-neutral-400 leading-relaxed font-serif text-lg">
												Passive tools are obsolete. The new canvas is active. It
												observes, anticipates, and executes. We build agents,
												not brushes.
											</p>
										</div>

										<div className="flex flex-col gap-4">
											<div className="font-mono text-xs text-neutral-500">
												03 /// FLOW
											</div>
											<h3 className="text-2xl font-bold text-white">
												Infinite Context.
											</h3>
											<p className="text-neutral-400 leading-relaxed font-serif text-lg">
												Creativity is memory. Our vector cores ensure no idea is
												lost. The system remembers every prompt, every seed,
												every iteration.
											</p>
										</div>

										<div className="flex flex-col gap-4">
											<div className="font-mono text-xs text-neutral-500">
												04 /// SOVEREIGNTY
											</div>
											<h3 className="text-2xl font-bold text-white">
												Your Weights. Your Rules.
											</h3>
											<p className="text-neutral-400 leading-relaxed font-serif text-lg">
												In the age of models, ownership is defined by the
												fine-tune. Your aesthetic is your IP. We protect the
												black box.
											</p>
										</div>
									</div>

									{/* Footer Sign-off */}
									<div className="pt-24 border-t border-neutral-900 flex justify-between items-end">
										<div className="font-mono text-xs text-neutral-600">
											STUDIO+233
											<br />
											EST. 2025
										</div>
										<SwissIcons.Box size={48} className="text-neutral-800" />
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</>
			)}
		</AnimatePresence>
	);
};
