import { motion } from "framer-motion";
import React from "react";

export interface Role {
	id: string;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface SwissRoleCardProps {
	role: Role;
	isSelected: boolean;
	onSelect: () => void;
}

export function SwissRoleCard({
	role,
	isSelected,
	onSelect,
}: SwissRoleCardProps) {
	const Icon = role.icon;

	return (
		<button
			onClick={onSelect}
			className={`
        relative w-full flex items-center gap-6 p-6 
        border transition-all duration-300 text-left group
        ${
					isSelected
						? "border-[#FF4D00] bg-[#FF4D00]/5"
						: "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
				}
      `}
		>
			{/* Selection Marker */}
			<div
				className={`
          w-3 h-3 border border-current transition-colors duration-300
          ${isSelected ? "bg-[#FF4D00] border-[#FF4D00]" : "border-neutral-400 bg-transparent"}
        `}
			/>

			{/* Icon */}
			<div
				className={`p-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black ${isSelected ? "text-[#FF4D00]" : "text-neutral-500"}`}
			>
				<Icon className="w-5 h-5" />
			</div>

			{/* Content */}
			<div className="flex-1">
				<div className="flex items-center justify-between mb-1">
					<h3
						className={`font-bold tracking-tight uppercase text-lg ${isSelected ? "text-[#FF4D00]" : "text-neutral-900 dark:text-white"}`}
					>
						{role.label}
					</h3>
					<span className="font-mono text-xs text-neutral-400">{role.id}</span>
				</div>
				<p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
					{role.description}
				</p>
			</div>

			{/* Hover Effect Corner */}
			<div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-r-[6px] border-t-transparent border-r-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity" />
		</button>
	);
}
