"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { SwissIcons } from "../ui/SwissIcons";

interface FieldPaletteProps {
	user: {
		name: string | null;
		email: string;
	};
}

// Reusable Terminate Dialog Component (Braun Style)
function TerminateDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isLoading: boolean;
}) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={() => {
					if (isLoading) return;
					onOpenChange(false);
				}}
				className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
			/>
			<motion.div
				initial={{ scale: 0.95, opacity: 0, y: 10 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				exit={{ scale: 0.95, opacity: 0, y: 10 }}
				transition={{ type: "spring", duration: 0.4, bounce: 0 }}
				className="relative w-[400px] bg-[#e5e5e5] dark:bg-[#111] overflow-hidden shadow-2xl"
			>
				{/* Top Bezel */}
				<div className="h-1.5 w-full bg-[#FF4D00]" />

				<div className="p-8 pb-10">
					{/* Header */}
					<div className="flex items-start justify-between mb-8">
						<div className="space-y-1">
							<h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF4D00]">
								System Alert
							</h3>
							<h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
								Terminate Session?
							</h2>
						</div>
						<div className="w-10 h-10 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-white dark:bg-black">
							<SwissIcons.Power className="w-5 h-5 text-neutral-900 dark:text-white" />
						</div>
					</div>

					{/* Content */}
					<p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1">
						Initiating termination sequence will close the secure connection.
						Local cache will be cleared. Unsaved changes in active buffers may
						be lost.
					</p>

					{/* Actions */}
					<div className="grid grid-cols-2 gap-4">
						<button
							onClick={() => {
								if (isLoading) return;
								onOpenChange(false);
							}}
							disabled={isLoading}
							className="h-12 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest font-bold text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							Cancel Sequence
						</button>
						<button
							onClick={onConfirm}
							disabled={isLoading}
							className="h-12 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<>
									<div className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
									Terminating…
								</>
							) : (
								<>
									<div className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
									Confirm Termination
								</>
							)}
						</button>
					</div>
				</div>

				{/* Decorative Footer */}
				<div className="h-2 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#fff_2px,#fff_4px)] opacity-5" />
			</motion.div>
		</div>
	);
}

export function FieldPalette({ user }: FieldPaletteProps) {
	const [isHovered, setIsHovered] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [isTerminating, setIsTerminating] = useState(false);

	// Dialog States
	const [isTerminateOpen, setIsTerminateOpen] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const playClickSound = () => {
		const AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioContext) return;

		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.type = "square";
		osc.frequency.setValueAtTime(150, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

		gain.gain.setValueAtTime(0.1, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.1);
	};

	const toggleTheme = () => {
		playClickSound();
		const nextTheme = theme === "dark" ? "light" : "dark";

		// @ts-ignore
		if (!document.startViewTransition) {
			setTheme(nextTheme);
			return;
		}

		const x = window.innerWidth / 2;
		const y = window.innerHeight / 2;
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y),
		);

		// @ts-ignore
		const transition = document.startViewTransition(async () => {
			setTheme(nextTheme);
		});

		transition.ready.then(() => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`,
			];
			document.documentElement.animate(
				{ clipPath },
				{
					duration: 800,
					easing: "ease-in-out",
					pseudoElement: "::view-transition-new(root)",
				},
			);
		});
	};

	const NAV_ITEMS = [
		{
			label: "HUB",
			href: "/dashboard",
			icon: SwissIcons.Grid,
			type: null, // No filter
		},
		{
			label: "CANVAS",
			href: "/dashboard?type=CANVAS",
			icon: SwissIcons.Frame,
			type: "CANVAS",
		},
		{
			label: "STUDIO+",
			href: "/dashboard?type=STUDIO",
			icon: SwissIcons.Circle,
			type: "STUDIO",
		},
	];

	const handleSignOut = async () => {
		if (isTerminating) return;
		setIsTerminating(true);
		try {
			await authClient.signOut();
			router.replace("/login");
		} catch (error) {
			console.error("Sign out failed", error);
			setIsTerminating(false);
		}
	};

	return (
		<>
			<AnimatePresence>
				{isTerminateOpen && (
					<TerminateDialog
						open={isTerminateOpen}
						onOpenChange={setIsTerminateOpen}
						onConfirm={handleSignOut}
						isLoading={isTerminating}
					/>
				)}
			</AnimatePresence>

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
						// Logic for active state
						const isHub = item.type === null;
						const currentType = searchParams.get("type");
						const isActive = isHub
							? pathname === "/dashboard" && !currentType
							: currentType === item.type;

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
						className="h-14 flex items-center relative group hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors bg-[#f4f4f0] dark:bg-[#111111] w-full text-left"
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
						onClick={toggleTheme}
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
									className="font-mono text-xs tracking-wider ml-14 whitespace-nowrap text-neutral-500 flex items-center gap-3"
								>
									{theme === "dark" ? "LIGHT_MODE" : "DARK_MODE"}
									{mounted && (
										<motion.div
											initial={{ opacity: 0, x: 8 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 8 }}
											transition={{ duration: 0.2 }}
											className="relative w-12 h-6 bg-[#e5e5e5] dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
										>
											<div className="absolute top-1/2 left-2 right-2 h-px bg-neutral-300 dark:bg-neutral-600" />
											<motion.div
												className="absolute top-[2px] bottom-[2px] w-5 bg-[#f0f0f0] dark:bg-[#3a3a3a] border border-neutral-300 dark:border-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center"
												animate={{
													left: theme === "dark" ? "calc(100% - 22px)" : "2px",
												}}
												transition={{
													type: "spring",
													stiffness: 600,
													damping: 35,
												}}
											>
												<div className="w-[2px] h-3 bg-[#FF4D00]" />
											</motion.div>
										</motion.div>
									)}
								</motion.span>
							)}
						</AnimatePresence>
					</button>

					{/* Sign Out */}
					<button
						onClick={() => setIsTerminateOpen(true)}
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
		</>
	);
}
