"use client";

import { ChevronLeft, Home, LayoutGrid, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BraunButton } from "./BraunButton";

interface OperatorHeaderProps {
	title?: string;
	mode: "canvas" | "studio";
	user?: {
		name: string | null;
		image?: string | null;
	};
}

export function OperatorHeader({ title, mode, user }: OperatorHeaderProps) {
	const router = useRouter();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
			{/* LEFT MODULE: Navigation & Context */}
			<div className="flex items-center gap-2 pointer-events-auto">
				<Link href="/dashboard">
					<BraunButton variant="icon" className="w-10 h-10">
						<Home className="w-4 h-4" />
					</BraunButton>
				</Link>

				<div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

				<div className="flex flex-col justify-center bg-[#f4f4f0]/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-[2px] shadow-sm">
					<span className="font-mono text-[9px] text-[#FF4D00] tracking-widest uppercase">
						{mode === "canvas" ? "Active Session" : "Batch Protocol"}
					</span>
					<h1 className="font-bold text-xs text-neutral-900 dark:text-white tracking-tight uppercase">
						{title || "Untitled_Project"}
					</h1>
				</div>
			</div>

			{/* RIGHT MODULE: User & System */}
			<div className="flex items-center gap-2 pointer-events-auto">
				<div className="bg-[#f4f4f0]/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-[2px] shadow-sm flex items-center gap-3">
					<div className="flex flex-col items-end">
						<span className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider">
							Status
						</span>
						<div className="flex items-center gap-1.5">
							<div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
							<span className="font-mono text-[10px] font-bold text-neutral-900 dark:text-white">
								ONLINE
							</span>
						</div>
					</div>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="w-10 h-10 bg-[#e5e5e5] dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-800 flex items-center justify-center hover:border-[#FF4D00] transition-colors outline-none">
							<Menu className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						sideOffset={8}
						className="w-56 bg-[#f4f4f0] dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800"
					>
						<DropdownMenuLabel className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
							System Menu
						</DropdownMenuLabel>
						<DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
						<DropdownMenuItem className="font-mono text-xs cursor-pointer focus:bg-neutral-200 dark:focus:bg-neutral-900">
							<Settings className="w-3 h-3 mr-2" />
							Preferences
						</DropdownMenuItem>
						<DropdownMenuItem className="font-mono text-xs cursor-pointer focus:bg-neutral-200 dark:focus:bg-neutral-900">
							<LayoutGrid className="w-3 h-3 mr-2" />
							Return to Hub
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
