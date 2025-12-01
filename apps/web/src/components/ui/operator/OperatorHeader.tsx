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
				{/* Home button removed as requested */}

				<div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />
			</div>

			{/* RIGHT MODULE: User & System */}
			<div className="flex items-center gap-2 pointer-events-auto"></div>
		</header>
	);
}
