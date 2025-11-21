"use client";

import React from "react";

export const DataTicker = () => {
	return (
		<div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#0a0a0a] h-8 flex items-center overflow-hidden">
			<div className="flex whitespace-nowrap animate-ticker font-mono text-[10px] uppercase tracking-widest text-neutral-500">
				{[...Array(10)].map((_, i) => (
					<span key={i} className="mx-8">
						// STUDIO+233 v1.0 // SYSTEM ONLINE // READY TO CREATE // BATCH
						PROCESSING AVAILABLE // ACCRA //
					</span>
				))}
			</div>
			<style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
		</div>
	);
};
