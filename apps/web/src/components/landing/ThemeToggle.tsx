"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = async (e: React.MouseEvent<HTMLButtonElement>) => {
		const newTheme = theme === "dark" ? "light" : "dark";

		// @ts-ignore - View Transitions API is not yet in all TS definitions
		if (!document.startViewTransition) {
			setTheme(newTheme);
			return;
		}

		const x = e.clientX;
		const y = e.clientY;

		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y),
		);

		// @ts-ignore
		const transition = document.startViewTransition(async () => {
			setTheme(newTheme);
			// Wait for React to flush updates
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		transition.ready.then(() => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`,
			];

			document.documentElement.animate(
				{
					clipPath: clipPath,
				},
				{
					duration: 500,
					easing: "ease-in-out",
					pseudoElement: "::view-transition-new(root)",
				},
			);
		});
	};

	if (!mounted) {
		return (
			<button className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
		);
	}

	return (
		<button
			onClick={toggleTheme}
			className="relative group w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-300 overflow-hidden"
			aria-label="Toggle Theme"
		>
			<div className="relative z-10 w-4 h-4">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="w-full h-full text-neutral-900 dark:text-white transition-transform duration-500 group-hover:scale-110"
				>
					{/* Outer Ring */}
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="2"
						className="opacity-100"
					/>
					{/* Inner Aperture - Changes based on theme */}
					<circle
						cx="12"
						cy="12"
						r={theme === "dark" ? "6" : "2"}
						fill="currentColor"
						className="transition-all duration-500 ease-in-out group-hover:r-6"
					/>
				</svg>
			</div>
			<div className="absolute inset-0 bg-neutral-900/5 dark:bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
		</button>
	);
}
