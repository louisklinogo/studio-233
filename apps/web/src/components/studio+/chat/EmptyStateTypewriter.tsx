import { motion } from "framer-motion";
import React from "react";

export function EmptyStateTypewriter() {
	const [isHovered, setIsHovered] = React.useState(false);
	const [delays, setDelays] = React.useState<
		{ repeat: number; initial: number }[]
	>([]);

	React.useEffect(() => {
		setDelays(
			Array.from({ length: 14 }).map(() => ({
				repeat: Math.random() * 0.5,
				initial: Math.random() * 0.2,
			})),
		);
	}, []);

	return (
		<div
			className="relative flex items-center justify-center w-48 h-48 cursor-pointer perspective-1000"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Paper (Extruding) */}
			{/* Placed behind the carriage but physically moving up */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-0 z-0 flex items-end justify-center overflow-visible">
				<motion.div
					className="w-20 bg-white/90 rounded-t-md shadow-sm border border-zinc-200 flex flex-col gap-2 p-2 items-start"
					initial={{ height: 10, opacity: 0, y: 20 }}
					animate={{
						height: isHovered ? 70 : 10,
						opacity: isHovered ? 1 : 0,
						y: isHovered ? -40 : 20,
					}}
					transition={{ type: "spring", stiffness: 100, damping: 15 }}
				>
					{/* Paper Text Lines */}
					<motion.div
						className="w-full h-1 bg-zinc-300 rounded-full"
						animate={{ width: isHovered ? "100%" : "0%" }}
						transition={{ delay: 0.1 }}
					/>
					<motion.div
						className="w-3/4 h-1 bg-zinc-200 rounded-full"
						animate={{ width: isHovered ? "75%" : "0%" }}
						transition={{ delay: 0.2 }}
					/>
					<motion.div
						className="w-1/2 h-1 bg-zinc-200 rounded-full"
						animate={{ width: isHovered ? "50%" : "0%" }}
						transition={{ delay: 0.3 }}
					/>
				</motion.div>
			</div>

			{/* Typewriter Body (Stylized) */}
			<div className="relative z-10 flex flex-col items-center transform translate-y-4">
				{/* Carriage / Roller (The horizontal bar) */}
				<motion.div
					className="w-32 h-8 bg-zinc-800 rounded-md shadow-lg border-t border-zinc-700 flex items-center justify-between px-2 relative"
					animate={{ x: isHovered ? [-2, 2, -2, 0] : 0 }}
					transition={{
						duration: 0.2,
						repeat: isHovered ? Infinity : 0,
						repeatDelay: 0.5,
					}}
				>
					{/* Knobs */}
					<div className="w-3 h-3 bg-zinc-600 rounded-full" />
					<div className="w-3 h-3 bg-zinc-600 rounded-full" />

					{/* Paper Slot Line */}
					<div className="absolute top-0 left-2 right-2 h-1 bg-black/50 rounded-b-sm" />
				</motion.div>

				{/* Keys Area (Sloped) */}
				<div className="w-40 h-12 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-b-xl shadow-2xl border-t border-zinc-700 transform -perspective-x-12 mt-[-4px] flex flex-wrap gap-1 p-2 justify-center items-start">
					{/* Generative Keys */}
					{delays.map((delay, i) => (
						<motion.div
							key={i}
							className="w-3 h-3 bg-zinc-700 rounded-full shadow-[0_2px_0_rgba(0,0,0,0.5)]"
							animate={{
								y: isHovered ? [0, 1, 0] : 0,
								backgroundColor: isHovered
									? ["#3f3f46", "#52525b", "#3f3f46"]
									: "#3f3f46",
							}}
							transition={{
								duration: 0.2,
								repeat: isHovered ? Infinity : 0,
								repeatDelay: delay.repeat,
								delay: delay.initial,
							}}
						/>
					))}
					{/* Spacebar */}
					<motion.div
						className="w-16 h-3 bg-zinc-700 rounded-full shadow-[0_2px_0_rgba(0,0,0,0.5)] mt-1"
						animate={{ y: isHovered ? [0, 1, 0] : 0 }}
						transition={{
							duration: 0.3,
							repeat: isHovered ? Infinity : 0,
							repeatDelay: 1.5,
						}}
					/>
				</div>
			</div>

			{/* Shadow */}
			<motion.div
				className="absolute bottom-14 w-32 h-4 bg-black/20 rounded-[100%] blur-md z-0"
				animate={{
					scaleX: isHovered ? 1.1 : 1,
					opacity: isHovered ? 0.4 : 0.2,
				}}
			/>
		</div>
	);
}
