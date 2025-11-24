"use client";

import {
	AnimatePresence,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import { Terminal, X } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface Command {
	id: string;
	text: string;
	type: "input" | "output" | "error" | "success";
}

export function CommandTerminal() {
	const [isOpen, setIsOpen] = useState(false);
	const [input, setInput] = useState("");
	const [history, setHistory] = useState<Command[]>([
		{ id: "init", text: "SYSTEM ONLINE. AWAITING INPUT.", type: "success" },
	]);
	const { theme, setTheme } = useTheme();
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// 3D Tilt Logic
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
	const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

	const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
	const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setIsOpen((prev) => !prev);
			}
			if (e.key === "Escape") {
				setIsOpen(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [history]);

	const handleMouseMove = (e: React.MouseEvent) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseXVal = e.clientX - rect.left;
		const mouseYVal = e.clientY - rect.top;
		const xPct = mouseXVal / width - 0.5;
		const yPct = mouseYVal / height - 0.5;
		x.set(xPct);
		y.set(yPct);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	const executeCommand = (cmd: string) => {
		const trimmedCmd = cmd.trim().toLowerCase();
		const newHistory = [
			...history,
			{ id: Date.now().toString(), text: `> ${cmd}`, type: "input" } as Command,
		];

		switch (trimmedCmd) {
			case "light":
			case "day":
				triggerThemeTransition("light");
				newHistory.push({
					id: Date.now() + "res",
					text: "EXECUTING: LIGHT_MODE_SEQUENCE...",
					type: "success",
				});
				break;
			case "dark":
			case "night":
				triggerThemeTransition("dark");
				newHistory.push({
					id: Date.now() + "res",
					text: "EXECUTING: DARK_MODE_SEQUENCE...",
					type: "success",
				});
				break;
			case "clear":
			case "cls":
				setHistory([]);
				return; // Early return to avoid setting history with cleared state + new command
			case "help":
				newHistory.push({
					id: Date.now() + "res",
					text: "AVAILABLE COMMANDS: LIGHT, DARK, CLEAR, HELP",
					type: "output",
				});
				break;
			default:
				newHistory.push({
					id: Date.now() + "res",
					text: `ERROR: UNKNOWN COMMAND "${trimmedCmd}"`,
					type: "error",
				});
		}

		setHistory(newHistory);
		setInput("");
	};

	const triggerThemeTransition = (newTheme: string) => {
		// @ts-ignore
		if (!document.startViewTransition) {
			setTheme(newTheme);
			return;
		}

		// Calculate center of screen for terminal-triggered transition
		const x = window.innerWidth / 2;
		const y = window.innerHeight / 2;
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y),
		);

		// @ts-ignore
		const transition = document.startViewTransition(async () => {
			setTheme(newTheme);
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		transition.ready.then(() => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`,
			];
			document.documentElement.animate(
				{ clipPath: clipPath },
				{
					duration: 800,
					easing: "ease-in-out",
					pseudoElement: "::view-transition-new(root)",
				},
			);
		});
	};

	return (
		<>
			{/* Header Trigger Button - 3D Terminal Icon */}
			<button
				onClick={() => setIsOpen(true)}
				className="relative group w-10 h-10 perspective-1000"
				aria-label="Open Terminal"
			>
				<div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
					{/* Front Face */}
					<div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm backface-hidden">
						<span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
							{">_"}
						</span>
					</div>
					{/* Back Face */}
					<div className="absolute inset-0 flex items-center justify-center bg-neutral-900 dark:bg-white border border-neutral-800 dark:border-neutral-200 rounded-lg shadow-sm backface-hidden rotate-y-180">
						<Terminal className="w-4 h-4 text-white dark:text-black" />
					</div>
				</div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
							onMouseMove={handleMouseMove}
							onMouseLeave={handleMouseLeave}
							className="relative w-full max-w-2xl perspective-1000"
						>
							{/* Glassmorphic Terminal Window */}
							<div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 bg-[#f4f4f0]/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl flex flex-col">
								{/* Header / Status Bar */}
								<div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-black/50">
									<div className="flex items-center gap-3">
										{/* Live Signal - Pulsing LED */}
										<div className="relative flex items-center justify-center w-3 h-3">
											<div className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-75" />
											<div className="relative w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
										</div>
										<span className="font-mono text-xs font-bold tracking-widest text-neutral-500 dark:text-neutral-400">
											TERMINAL_V1.0 :: SYSTEM_READY
										</span>
									</div>
									<button
										onClick={() => setIsOpen(false)}
										className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"
									>
										<X className="w-4 h-4 text-neutral-500" />
									</button>
								</div>

								{/* Output Area */}
								<div
									ref={scrollRef}
									className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
								>
									{history.map((cmd) => (
										<div
											key={cmd.id}
											className={`${
												cmd.type === "error"
													? "text-red-500"
													: cmd.type === "success"
														? "text-green-500"
														: cmd.type === "input"
															? "text-neutral-400"
															: "text-neutral-700 dark:text-neutral-300"
											}`}
										>
											{cmd.text}
										</div>
									))}
								</div>

								{/* Input Area */}
								<div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/30 dark:bg-black/30 flex items-center gap-2">
									<span className="text-[#FF4D00] font-mono font-bold">
										{">"}
									</span>
									<input
										ref={inputRef}
										type="text"
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && input.trim()) {
												executeCommand(input);
											}
										}}
										className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-neutral-900 dark:text-white placeholder-neutral-400"
										placeholder="ENTER COMMAND..."
										autoFocus
									/>
									{/* Blinking Cursor Block */}
									<div className="w-2 h-4 bg-[#FF4D00] animate-pulse" />
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
