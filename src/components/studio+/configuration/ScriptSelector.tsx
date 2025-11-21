"use client";

import { Terminal } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_SCRIPTS, WorkflowType } from "./constants";

interface ScriptSelectorProps {
	value: WorkflowType;
	onChange: (value: WorkflowType) => void;
}

export function ScriptSelector({ value, onChange }: ScriptSelectorProps) {
	const currentScript =
		AVAILABLE_SCRIPTS.find((s) => s.id === value) || AVAILABLE_SCRIPTS[0];

	return (
		<div className="p-3 border-b border-border bg-muted/20">
			<div className="flex items-center gap-2 mb-1">
				<Terminal className="w-4 h-4 text-muted-foreground" />
				<span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
					Script Select
				</span>
			</div>
			<Select value={value} onValueChange={(v) => onChange(v as WorkflowType)}>
				<SelectTrigger className="w-full bg-background border-border text-foreground h-9 rounded-md focus:ring-ring">
					<div className="flex items-center gap-2">
						<currentScript.icon className="w-4 h-4 text-muted-foreground" />
						<SelectValue placeholder="Select script..." />
					</div>
				</SelectTrigger>
				<SelectContent className="bg-background border-border">
					{AVAILABLE_SCRIPTS.map((script) => (
						<SelectItem
							key={script.id}
							value={script.id}
							className="focus:bg-accent focus:text-accent-foreground text-muted-foreground"
						>
							<span className="font-mono">{script.name}</span>
							<span className="ml-2 text-xs text-muted-foreground opacity-50">
								({script.label})
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="mt-2 text-xs text-muted-foreground leading-relaxed px-1 font-mono">
				// {currentScript.description}
			</div>
		</div>
	);
}
