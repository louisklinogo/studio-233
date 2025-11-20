import { Check } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
	currentTheme: "obsidian" | "sage" | "stone";
	onThemeChange: (theme: "obsidian" | "sage" | "stone") => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
	currentTheme,
	onThemeChange,
}) => {
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				Color Theme
			</label>
			<div className="grid grid-cols-3 gap-2">
				<button
					onClick={() => onThemeChange("obsidian")}
					className={cn(
						"flex flex-col items-center gap-2 rounded-lg border p-2 hover:bg-accent transition-all",
						currentTheme === "obsidian" && "border-primary ring-1 ring-primary",
					)}
				>
					<div className="h-8 w-8 rounded-full bg-slate-900 border border-border"></div>
					<span className="text-xs font-medium">Obsidian</span>
				</button>

				<button
					onClick={() => onThemeChange("sage")}
					className={cn(
						"flex flex-col items-center gap-2 rounded-lg border p-2 hover:bg-accent transition-all",
						currentTheme === "sage" && "border-primary ring-1 ring-primary",
					)}
				>
					<div className="h-8 w-8 rounded-full bg-emerald-700 border border-border"></div>
					<span className="text-xs font-medium">Sage</span>
				</button>

				<button
					onClick={() => onThemeChange("stone")}
					className={cn(
						"flex flex-col items-center gap-2 rounded-lg border p-2 hover:bg-accent transition-all",
						currentTheme === "stone" && "border-primary ring-1 ring-primary",
					)}
				>
					<div className="h-8 w-8 rounded-full bg-stone-600 border border-border"></div>
					<span className="text-xs font-medium">Stone</span>
				</button>
			</div>
		</div>
	);
};
