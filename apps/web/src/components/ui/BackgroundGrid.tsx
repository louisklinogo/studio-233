import { cn } from "@/lib/utils";

interface BackgroundGridProps {
	className?: string;
}

export function BackgroundGrid({ className }: BackgroundGridProps) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-50",
				className,
			)}
		/>
	);
}
