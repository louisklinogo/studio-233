import React from "react";
import { cn } from "@/lib/utils";

interface StudioLogoProps {
	className?: string; // For sizing (text-xl, etc.)
	variant?: "full" | "icon" | "mark"; // full = STUDIO+233, icon = +, mark = +233
}

export const StudioLogo: React.FC<StudioLogoProps> = ({
	className,
	variant = "full",
}) => {
	if (variant === "icon") {
		return (
			<div
				className={cn(
					"flex items-center justify-center font-sans select-none text-[#FF4D00] font-bold",
					className,
				)}
				aria-label="Studio+233 Icon"
			>
				+
			</div>
		);
	}

	if (variant === "mark") {
		return (
			<div
				className={cn(
					"flex items-center tracking-tighter font-sans select-none",
					className,
				)}
				aria-label="Studio+233 Mark"
			>
				<span className="text-[#FF4D00] font-bold mr-[0.02em]">+</span>
				<span className="font-black text-foreground">233</span>
			</div>
		);
	}

	// Default full logo
	return (
		<div
			className={cn(
				"flex items-center tracking-tighter font-sans select-none",
				className,
			)}
			aria-label="Studio+233"
		>
			<span className="font-black text-foreground">STUDIO</span>
			<span className="text-[#FF4D00] font-bold mx-[0.02em]">+</span>
			<span className="font-black text-foreground">233</span>
		</div>
	);
};
