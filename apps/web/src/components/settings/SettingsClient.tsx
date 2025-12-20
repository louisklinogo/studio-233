"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface SettingsClientProps {
	user: any; // Ideally properly typed from Prisma
}

// Reusable "Control Panel" Section
function SettingsSection({
	title,
	children,
	description,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-8 rounded-sm space-y-6">
			<div className="flex flex-col gap-1 border-b border-neutral-100 dark:border-neutral-800 pb-4">
				<h3 className="font-mono text-sm uppercase tracking-widest font-bold text-neutral-900 dark:text-white">
					{title}
				</h3>
				{description && (
					<p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-prose">
						{description}
					</p>
				)}
			</div>
			<div className="space-y-6">{children}</div>
		</section>
	);
}

// Styled Input Field
function ControlInput({
	label,
	value,
	readOnly = false,
}: {
	label: string;
	value: string;
	readOnly?: boolean;
}) {
	return (
		<div className="space-y-2">
			<label className="font-mono text-[10px] uppercase text-neutral-500 tracking-wider">
				{label}
			</label>
			<div className="relative">
				<input
					readOnly={readOnly}
					value={value}
					className={`
            w-full bg-neutral-100 dark:bg-[#111] border-none rounded-sm px-4 py-3 
            font-mono text-sm text-neutral-900 dark:text-white 
            focus:ring-1 focus:ring-[#FF4D00] outline-none transition-all
            ${readOnly ? "opacity-60 cursor-not-allowed" : ""}
          `}
				/>
				{readOnly && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2">
						<SwissIcons.Lock className="w-3 h-3 text-neutral-400" />
					</div>
				)}
			</div>
		</div>
	);
}

export function SettingsClient({ user }: SettingsClientProps) {
	return (
		<div className="space-y-12 pb-24">
			{/* Header */}
			<header className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-[#FF4D00]" />
						<span className="font-mono text-xs tracking-[0.3em] text-[#FF4D00]">
							SYSTEM_CONFIG
						</span>
					</div>
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
						Settings
					</h1>
				</div>
				<div className="hidden md:block font-mono text-xs text-neutral-400">
					OPERATOR_ID: {user.id.slice(0, 8).toUpperCase()}
				</div>
			</header>

			{/* Main Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Column 1: Identity & Security */}
				<div className="lg:col-span-2 space-y-8">
					<SettingsSection
						title="Operator Identity"
						description="Personal identification and access credentials."
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<ControlInput label="Display Name" value={user.name || ""} />
							<ControlInput label="Email Address" value={user.email} readOnly />
						</div>
					</SettingsSection>

					<SettingsSection
						title="Workspace Configuration"
						description="Global parameters for your default workspace environment."
					>
						<div className="space-y-6">
							<ControlInput label="Workspace Slug" value="main-workspace" />
							<div className="flex items-center justify-between p-4 bg-neutral-100 dark:bg-[#111] rounded-sm">
								<div className="space-y-1">
									<div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
										PUBLIC_VISIBILITY
									</div>
									<div className="text-[10px] text-neutral-500">
										Allow external access to shared canvases
									</div>
								</div>
								{/* Toggle Switch */}
								<div className="w-10 h-5 bg-neutral-300 dark:bg-neutral-700 rounded-full relative cursor-pointer">
									<div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
								</div>
							</div>
						</div>
					</SettingsSection>
				</div>

				{/* Column 2: Plan & Usage (Telemetry) */}
				<div className="space-y-8">
					<SettingsSection title="Plan Status">
						<div className="bg-neutral-900 dark:bg-white text-white dark:text-black p-6 rounded-sm space-y-4">
							<div className="flex justify-between items-start">
								<span className="font-mono text-xs tracking-widest uppercase">
									Current Tier
								</span>
								<div className="px-2 py-1 bg-[#FF4D00] text-white text-[9px] font-bold font-mono rounded-sm">
									PRO
								</div>
							</div>
							<div className="text-2xl font-bold">Professional</div>
							<div className="h-px bg-white/20 dark:bg-black/20" />
							<div className="space-y-2">
								<div className="flex justify-between text-xs font-mono">
									<span>COMPUTE</span>
									<span>124/1000</span>
								</div>
								<div className="w-full h-1 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
									<div className="w-[12%] h-full bg-[#FF4D00]" />
								</div>
							</div>
						</div>
						<button className="w-full py-3 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-mono text-xs uppercase tracking-widest transition-colors rounded-sm">
							Manage Billing
						</button>
					</SettingsSection>

					<SettingsSection title="API Access">
						<div className="space-y-4">
							<div className="p-3 bg-neutral-100 dark:bg-[#111] font-mono text-[10px] break-all text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-sm">
								sk_live_********************x92
							</div>
							<button className="text-xs text-[#FF4D00] hover:underline font-mono uppercase tracking-wide">
								Generate New Key
							</button>
						</div>
					</SettingsSection>
				</div>
			</div>
		</div>
	);
}
