import React from "react";
import { cn } from "@/lib/utils";

interface StudioLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function StudioLayout({ children, className }: StudioLayoutProps) {
	return (
		<div
			className={cn(
				"flex h-screen w-full bg-background text-foreground overflow-hidden",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function StudioSidebar({ children, className }: StudioLayoutProps) {
	return (
		<aside
			className={cn(
				"w-[500px] border-r bg-card flex flex-col z-10 shadow-sm",
				className,
			)}
		>
			{children}
		</aside>
	);
}

export function StudioContent({ children, className }: StudioLayoutProps) {
	return (
		<main className={cn("flex-1 flex flex-col relative bg-muted/5", className)}>
			{children}
		</main>
	);
}

export function StudioHeader({ children, className }: StudioLayoutProps) {
	return (
		<header
			className={cn(
				"h-14 border-b bg-card/50 backdrop-blur-md flex items-center px-4 justify-between shrink-0",
				className,
			)}
		>
			{children}
		</header>
	);
}
