"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { SwissIcons } from "../ui/SwissIcons";

interface FieldPaletteProps {
	user: {
		name: string | null;
		email: string;
	};
}

export function FieldPalette({ user }: FieldPaletteProps) {
	const [isHovered, setIsHovered] = useState(false);
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const router = useRouter();

	const NAV_ITEMS = [
		{
			label: "HUB",
			href: "/dashboard",
			icon: SwissIcons.Grid,
		},
		{
			label: "CANVAS",
			href: "/canvas",
			icon: SwissIcons.Frame,
		},
		{
			label: "STUDIO",
			href: "/studio",
			icon: SwissIcons.Circle,
		},
	];

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	return (
		<motion.div
			className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800 shadow-2xl rounded-sm overflow-hidden"
			initial={{ width: "56px" }}
			animate={{ width: isHovered ? "220px" : "56px" }}
			transition={{ type: "spring", stiffness: 400, damping: 30 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Chassis Background */}
			<div className="absolute inset-0 bg-[#f4f4f0] dark:bg-[#111111] -z-10" />

			{/* Header / Brand */}
			<div className="h-14 flex items-center justify-center bg-[#f4f4f0] dark:bg-[#111111] relative">
				<div className="absolute left-0 w-14 flex items-center justify-center">
					<div className="w-2 h-2 bg-[#FF4D00] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" />
				</div>
				<AnimatePresence>
					{isHovered && (
						<motion.span
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							className="font-black text-sm tracking-tighter uppercase ml-10 whitespace-nowrap text-neutral-900 dark:text-neutral-100"
						>
							Studio+233
						</motion.span>
					)}
				</AnimatePresence>
			</div>

			{/* Navigation Items */}
			<div className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800">
				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`
                h-14 flex items-center relative group transition-colors bg-[#f4f4f0] dark:bg-[#111111]
                ${isActive ? "bg-white dark:bg-[#1a1a1a]" : "hover:bg-white dark:hover:bg-[#1a1a1a]"}
              `}
						>
							{/* Active Indicator (Recessed LED) */}
							<div className="absolute left-0 w-1 h-full flex items-center justify-center">
								{isActive && (
									<motion.div
										layoutId="activeNav"
										className="w-1 h-8 bg-[#FF4D00] rounded-r-sm shadow-[0_0_8px_rgba(255,77,0,0.5)]"
									/>
								)}
							</div>

							{/* Icon */}
							<div className="absolute left-0 w-14 flex items-center justify-center">
								<Icon
									size={20}
									className={`transition-colors ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"}`}
								/>
							</div>

							{/* Label */}
							<AnimatePresence>
								{isHovered && (
									<motion.span
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -10 }}
										className={`font-mono text-xs tracking-wider ml-14 whitespace-nowrap ${isActive ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-500"}`}
									>
										{item.label}
									</motion.span>
								)}
							</AnimatePresence>
						</Link>
					);
				})}
			</div>

			{/* System Controls */}
			<div className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800 mt-[1px]">
				{/* Settings */}
				<Link
					href="/settings"
					className="h-14 flex items-center relative group hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors bg-[#f4f4f0] dark:bg-[#111111]"
				>
					<div className="absolute left-0 w-14 flex items-center justify-center">
						<SwissIcons.Slider
							size={20}
							className="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
						/>
					</div>
					<AnimatePresence>
						{isHovered && (
							<motion.span
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="font-mono text-xs tracking-wider ml-14 whitespace-nowrap text-neutral-500"
							>
								SETTINGS
							</motion.span>
						)}
					</AnimatePresence>
				</Link>

				{/* Theme Toggle */}
				<button
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					className="h-14 flex items-center relative group hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors w-full text-left bg-[#f4f4f0] dark:bg-[#111111]"
				>
					<div className="absolute left-0 w-14 flex items-center justify-center">
						<SwissIcons.Contrast
							size={20}
							className="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
						/>
					</div>
					<AnimatePresence>
						{isHovered && (
							<motion.span
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="font-mono text-xs tracking-wider ml-14 whitespace-nowrap text-neutral-500"
							>
								{theme === "dark" ? "LIGHT_MODE" : "DARK_MODE"}
							</motion.span>
						)}
					</AnimatePresence>
				</button>

				{/* Sign Out */}
				<button
					onClick={handleSignOut}
					className="h-14 flex items-center relative group hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full text-left bg-[#f4f4f0] dark:bg-[#111111]"
				>
					<div className="absolute left-0 w-14 flex items-center justify-center">
						<SwissIcons.Power
							size={20}
							className="text-neutral-400 group-hover:text-red-500 transition-colors"
						/>
					</div>
					<AnimatePresence>
						{isHovered && (
							<motion.span
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="font-mono text-xs tracking-wider ml-14 whitespace-nowrap text-neutral-500 group-hover:text-red-500"
							>
								TERMINATE
							</motion.span>
						)}
					</AnimatePresence>
				</button>
			</div>

			{/* User Profile (Footer) */}
			<div className="h-14 flex items-center relative bg-[#f4f4f0] dark:bg-[#111111] mt-[1px]">
				<div className="absolute left-0 w-14 flex items-center justify-center">
					<div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-sm flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 shadow-inner">
						{(user.name || "OP").slice(0, 2).toUpperCase()}
					</div>
				</div>
				<AnimatePresence>
					{isHovered && (
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							className="ml-14 flex flex-col justify-center"
						>
							<span className="font-bold text-[10px] text-neutral-900 dark:text-white truncate max-w-[140px]">
								{user.name || "OPERATOR"}
							</span>
							<span className="font-mono text-[9px] text-neutral-400 truncate max-w-[140px]">
								{user.email}
							</span>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
