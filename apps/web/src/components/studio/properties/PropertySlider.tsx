import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface PropertySliderProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	label?: string;
	className?: string;
}

export const PropertySlider: React.FC<PropertySliderProps> = ({
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	label,
	className,
}) => {
	return (
		<div className={cn("flex flex-col gap-1 w-full", className)}>
			{label && (
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>{label}</span>
					<span>{value}</span>
				</div>
			)}
			<Slider
				value={[value]}
				min={min}
				max={max}
				step={step}
				onValueChange={(vals) => onChange(vals[0])}
				className="py-1"
			/>
		</div>
	);
};
