"use client";

import React from "react";

export const ScannerFooter = () => {
	return (
		<div className="w-full overflow-hidden relative">
			{/* Base Text (Dim) */}
			<h1 className="text-[15vw] leading-[0.8] font-bold tracking-tighter text-neutral-300/30 dark:text-neutral-800/30 select-none pointer-events-none whitespace-nowrap -ml-1">
				STUDIO
				<span className="text-[0.4em] inline-block align-top -mt-2 ml-1">
					+233
				</span>
			</h1>

			{/* Scanned Text (Dynamic Color) */}
			<h1 className="absolute inset-0 text-[15vw] leading-[0.8] font-bold tracking-tighter select-none pointer-events-none whitespace-nowrap -ml-1 animate-scan-text">
				STUDIO
				<span className="text-[0.4em] inline-block align-top -mt-2 ml-1">
					+233
				</span>
			</h1>

			{/* The Beam */}
			<div className="absolute inset-0 animate-scan-beam pointer-events-none" />

			<style jsx>{`
        @keyframes scan-text {
          0% { 
            clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%);
            color: #171717; /* Neutral-900 (Black/Dark) */
            text-shadow: none;
          }
          49.9% {
            color: #171717;
            text-shadow: none;
          }
          50% { 
            clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%);
            color: #BFFF6D; /* Lime Green */
            text-shadow: 0 0 15px rgba(191,255,109,0.5);
          }
          100% { 
            clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%); 
            color: #BFFF6D;
            text-shadow: 0 0 15px rgba(191,255,109,0.5);
          }
        }
        
        .animate-scan-text {
          animation: scan-text 8s ease-in-out infinite alternate;
        }
      `}</style>
		</div>
	);
};
