"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { SwissInput } from "./SwissInput";
import { SwissRoleCard } from "./SwissRoleCard";
import { SwissToggle } from "./SwissToggle";

interface OnboardingFlowProps {
	initialName: string;
	userId: string;
	action: (formData: FormData) => void;
}

const ROLES = [
	{
		id: "ARCHITECT",
		label: "Architect",
		description: "Design systems and visual hierarchies.",
		icon: "A",
	},
	{
		id: "ENGINEER",
		label: "Engineer",
		description: "Build pipelines and automation flows.",
		icon: "E",
	},
	{
		id: "OBSERVER",
		label: "Observer",
		description: "Monitor analytics and outputs.",
		icon: "O",
	},
];

export function OnboardingFlow({
	initialName,
	userId,
	action,
}: OnboardingFlowProps) {
	const [step, setStep] = useState(1);
	const [name, setName] = useState(initialName);
	const [role, setRole] = useState<string | null>(null);
	const [isComplete, setIsComplete] = useState(false);

	const handleContinue = () => {
		if (step === 1 && name.length > 1) setStep(2);
		if (step === 2 && role) setStep(3);
	};

	const handleSubmit = () => {
		setIsComplete(true);
		const formData = new FormData();
		formData.append("name", name);
		// We aren't saving role to DB yet, but passing it conceptually
		action(formData);
	};

	return (
		<div className="w-full max-w-4xl mx-auto relative z-20 flex flex-col md:flex-row min-h-[600px] border border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#0a0a0a] shadow-2xl">
			{/* Sidebar / Progress - Swiss Grid Style */}
			<div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 p-8 flex flex-col justify-between bg-neutral-100 dark:bg-neutral-900/50">
				<div>
					<div className="mb-12">
						<p className="font-mono text-[9px] tracking-widest text-[#FF4D00] mb-2 uppercase">
							System Initialization
						</p>
						<h1 className="text-3xl font-black tracking-tighter uppercase leading-[0.9]">
							Setup
							<br />
							Protocol
						</h1>
					</div>

					<div className="space-y-6 font-mono text-xs">
						<div
							className={`flex items-center justify-between transition-opacity duration-300 ${step === 1 ? "opacity-100" : "opacity-40"}`}
						>
							<span>01 / IDENTITY</span>
							{step > 1 && <span className="text-[#FF4D00]">[OK]</span>}
						</div>
						<div
							className={`flex items-center justify-between transition-opacity duration-300 ${step === 2 ? "opacity-100" : "opacity-40"}`}
						>
							<span>02 / MODULE</span>
							{step > 2 && <span className="text-[#FF4D00]">[OK]</span>}
						</div>
						<div
							className={`flex items-center justify-between transition-opacity duration-300 ${step === 3 ? "opacity-100" : "opacity-40"}`}
						>
							<span>03 / UPLINK</span>
							{isComplete && <span className="text-[#FF4D00]">[OK]</span>}
						</div>
					</div>
				</div>

				<div className="hidden md:block font-mono text-[9px] text-neutral-400 break-all">
					ID: {userId}
				</div>
			</div>

			{/* Main Content Area */}
			<div className="w-full md:w-2/3 p-8 md:p-16 relative overflow-hidden flex flex-col justify-center">
				<AnimatePresence mode="wait">
					{/* STEP 1: IDENTITY */}
					{step === 1 && (
						<motion.div
							key="step1"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.4, ease: "circOut" }}
							className="space-y-8"
						>
							<div className="space-y-2">
								<label
									htmlFor="name"
									className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500"
								>
									Enter Callsign
								</label>
								<SwissInput
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="OPERATOR_NAME"
									autoFocus
								/>
							</div>

							<button
								onClick={handleContinue}
								disabled={name.length < 2}
								className="group flex items-center gap-2 font-mono text-xs tracking-widest uppercase hover:text-[#FF4D00] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							>
								Confirm Identity
								<ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
							</button>
						</motion.div>
					)}

					{/* STEP 2: ROLE */}
					{step === 2 && (
						<motion.div
							key="step2"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.4, ease: "circOut" }}
							className="space-y-8 w-full"
						>
							<div className="space-y-2">
								<p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
									Select Driver Module
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4">
								{ROLES.map((r) => (
									<SwissRoleCard
										key={r.id}
										role={r}
										isSelected={role === r.id}
										onSelect={() => setRole(r.id)}
									/>
								))}
							</div>

							<button
								onClick={handleContinue}
								disabled={!role}
								className="group flex items-center gap-2 font-mono text-xs tracking-widest uppercase hover:text-[#FF4D00] transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-4"
							>
								Install Driver
								<ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
							</button>
						</motion.div>
					)}

					{/* STEP 3: CONFIRM */}
					{step === 3 && (
						<motion.div
							key="step3"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.4, ease: "circOut" }}
							className="space-y-12 flex flex-col items-start justify-center h-full"
						>
							<div className="space-y-4">
								<p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
									Ready for Uplink
								</p>
								<h2 className="text-4xl font-black tracking-tighter uppercase">
									Initialize
									<br />
									System
								</h2>
								<p className="text-sm text-neutral-500 max-w-xs">
									By engaging the uplink, you accept the operating protocols of
									Studio+233.
								</p>
							</div>

							<div className="pt-4">
								<SwissToggle onToggle={handleSubmit} />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
