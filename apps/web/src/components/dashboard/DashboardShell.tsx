"use client";

import {
	CircuitBoard,
	LayoutGrid,
	LogOut,
	Moon,
	Settings,
	Sun,
	TerminalSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { FieldPalette } from "./FieldPalette";

interface DashboardShellProps {
	children: React.ReactNode;
	user: {
		name: string | null;
		id: string;
		email: string;
	};
}

export function DashboardShell({ children, user }: DashboardShellProps) {
	return (
		<div className="flex min-h-screen bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300">
			{/* Floating Field Palette */}
			<FieldPalette user={user} />

			{/* Main Content */}
			<main className="flex-1 min-h-screen relative overflow-hidden pl-[72px] md:pl-[20%]">
				<BackgroundGrid />
				<div className="relative z-10 p-8 md:p-12 max-w-7xl w-full">
					{children}
				</div>
			</main>
		</div>
	);
}
