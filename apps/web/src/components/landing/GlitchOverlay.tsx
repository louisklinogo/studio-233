"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export const GlitchOverlay = () => {
	const [isUnlocked, setIsUnlocked] = useState(false);

	useEffect(() => {
		const handleUnlock = () => {
			setIsUnlocked(true);
		};

		window.addEventListener("unlockModes", handleUnlock);
		return () => window.removeEventListener("unlockModes", handleUnlock);
	}, []);

	return (
		<AnimatePresence>
			{!isUnlocked && (
				<motion.div
					className="absolute inset-0 z-50 pointer-events-none"
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					{/* Glitch bars that shatter away */}
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<motion.div
							key={i}
							className="absolute inset-x-0 h-[16.666%] bg-[#FF4D00] border-y border-black pointer-events-none"
							style={{ top: `${i * 16.666}%` }}
							exit={{
								x: i % 2 === 0 ? -1000 : 1000,
								opacity: 0,
								transition: {
									duration: 0.4,
									delay: i * 0.05,
									ease: "easeInOut",
								},
							}}
						>
							{/* Scanline texture */}
							<div
								className="absolute inset-0 opacity-20"
								style={{
									backgroundImage:
										"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
								}}
							/>
							{/* Glitch text */}
							<div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-black/30 tracking-widest">
								[LOCKED] [LOCKED] [LOCKED]
							</div>
						</motion.div>
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
};
