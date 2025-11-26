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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

interface DashboardShellProps {
	children: React.ReactNode;
	user: {
		name: string | null;
		id: string;
		email: string;
	};
}

export function DashboardShell({ children, user }: DashboardShellProps) {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const router = useRouter();

	const NAV_ITEMS = [
		{
			label: "HUB",
			href: "/dashboard",
			icon: LayoutGrid,
		},
		{
			label: "CANVAS",
			href: "/canvas",
			icon: TerminalSquare,
		},
		{
			label: "STUDIO",
			href: "/studio",
			icon: CircuitBoard,
		},
		{
			label: "SETTINGS",
			href: "/settings",
			icon: Settings,
		},
	];

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	return (
		<div className="flex min-h-screen bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300">
			{/* Sidebar */}
			<aside className="w-64 border-r border-neutral-200 dark:border-neutral-900 flex flex-col fixed h-full z-50 bg-white dark:bg-[#050505] transition-colors duration-300">
				<div className="p-6 border-b border-neutral-200 dark:border-neutral-900">
					<h1 className="font-black text-2xl tracking-tighter text-[#FF4D00] uppercase leading-none">
						Studio+233
					</h1>
				</div>

				<nav className="flex-1 flex flex-col gap-1 p-4">
					{NAV_ITEMS.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`
                  flex items-center gap-3 px-4 py-3 rounded-sm transition-colors group
                  ${isActive ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"}
                `}
							>
								<Icon
									className={`w-4 h-4 ${isActive ? "text-[#FF4D00]" : "text-neutral-600 group-hover:text-neutral-800 dark:group-hover:text-neutral-400"}`}
								/>
								<span className="font-mono text-xs tracking-wider">
									{item.label}
								</span>
							</Link>
						);
					})}
				</nav>

				<div className="p-4 border-t border-neutral-200 dark:border-neutral-900">
					<DropdownMenu>
						<DropdownMenuTrigger className="w-full outline-none">
							<div className="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors rounded-sm cursor-pointer group">
								<div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center font-bold text-neutral-500 group-hover:border-[#FF4D00] group-hover:text-[#FF4D00] transition-colors">
									{(user.name || "OP").slice(0, 2).toUpperCase()}
								</div>
								<div className="flex flex-col overflow-hidden text-left">
									<span className="text-xs font-bold truncate text-neutral-900 dark:text-white group-hover:text-[#FF4D00] transition-colors">
										{user.name || "Operator"}
									</span>
									<span className="text-[10px] font-mono text-neutral-600 truncate">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							side="right"
							sideOffset={12}
							className="w-56 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200"
						>
							<DropdownMenuLabel className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">
								System Controls
							</DropdownMenuLabel>
							<DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
							<DropdownMenuItem
								className="focus:bg-neutral-100 dark:focus:bg-neutral-900 focus:text-[#FF4D00] cursor-pointer"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							>
								{theme === "dark" ? (
									<Sun className="w-4 h-4 mr-2" />
								) : (
									<Moon className="w-4 h-4 mr-2" />
								)}
								<span className="font-mono text-xs">
									Theme: {theme === "dark" ? "Dark" : "Light"}
								</span>
							</DropdownMenuItem>
							<Link href="/settings">
								<DropdownMenuItem className="focus:bg-neutral-100 dark:focus:bg-neutral-900 focus:text-[#FF4D00] cursor-pointer">
									<Settings className="w-4 h-4 mr-2" />
									<span className="font-mono text-xs">Preferences</span>
								</DropdownMenuItem>
							</Link>
							<DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
							<DropdownMenuItem
								className="focus:bg-neutral-100 dark:focus:bg-neutral-900 focus:text-red-500 text-neutral-500 dark:text-neutral-400 cursor-pointer"
								onClick={handleSignOut}
							>
								<LogOut className="w-4 h-4 mr-2" />
								<span className="font-mono text-xs">Terminate Session</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
				{/* Background Grid */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none" />

				<div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
					{children}
				</div>
			</main>
		</div>
	);
}
