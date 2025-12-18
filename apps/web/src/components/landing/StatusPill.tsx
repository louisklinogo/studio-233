"use client";

import React from "react";

export const StatusPill = () => {
	return (
		<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/40 border border-border backdrop-blur-sm mb-1">
			<span className="relative flex h-1.5 w-1.5">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
			</span>
			<span className="text-[10px] font-mono font-medium tracking-wider text-muted-foreground uppercase">
				SYSTEM ONLINE
			</span>
		</div>
	);
};
