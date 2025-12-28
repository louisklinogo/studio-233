"use client";

import gsap from "gsap";
import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

interface HoverBlockProps {
	word: string;
	imageUrl?: string;
	index?: string;
	className?: string;
}

const HoverBlock: React.FC<HoverBlockProps> = ({
	word,
	imageUrl,
	index,
	className,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const isInteractive = !!imageUrl;
	const isRefiner = [
		"PURITY",
		"LOGIC.",
		"SIGNAL",
		"CREATIVE",
		"PROCESS.",
	].includes(word.toUpperCase());

	return (
		<div
			onMouseEnter={() => isInteractive && setIsHovered(true)}
			onMouseLeave={() => isInteractive && setIsHovered(false)}
			className={`
                kinetic-block relative overflow-hidden px-4 py-2 sm:px-8 sm:py-4 bg-[#1a1a1a] border transition-colors duration-500
                ${isInteractive ? "cursor-switch" : "cursor-default"}
                ${isHovered ? "border-[#FF4400] z-10" : "border-white/10"}
                ${className || ""}
            `}
		>
			<div className="relative z-20 shutter-container overflow-hidden">
				<span
					className={`
                    kinetic-text inline-block will-change-transform
                    text-4xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-none
                    ${isHovered && isInteractive ? "text-[#FF4400]" : "text-white"}
					${isRefiner && !isHovered ? "animate-pulse text-[#FF4400]/80" : ""}
                    transition-colors duration-300
                `}
				>
					{word}
				</span>
				{/* The Mechanical Shutter - Initial height is 100% */}
				<div className="shutter-overlay absolute inset-0 bg-[#1a1a1a] z-30 origin-bottom" />
			</div>

			{isInteractive && (
				<div
					className={`absolute top-1 right-1 w-1.5 h-1.5 transition-colors duration-300 ${isHovered ? "bg-[#FF4400]" : "bg-white/20"}`}
				/>
			)}

			{imageUrl && (
				<div
					className={`absolute inset-0 z-10 transition-all duration-500 ease-out overflow-hidden pointer-events-none ${
						isHovered ? "opacity-100" : "opacity-0"
					}`}
				>
					<img
						src={imageUrl}
						className={`w-full h-full object-cover grayscale transition-transform duration-700 ${isHovered ? "scale-105" : "scale-150"}`}
						style={{
							transformOrigin: "center center",
							transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
						}}
						alt=""
					/>
					<div className="absolute inset-0 bg-[#FF4400] mix-blend-multiply opacity-20" />
					<div className="absolute bottom-2 left-2 text-[8px] font-mono text-white bg-black px-1 uppercase invert">
						REF_{index}
					</div>
				</div>
			)}
		</div>
	);
};

export interface KineticTrackHandle {
	track: HTMLDivElement | null;
	blocks: HTMLElement[];
	images: HTMLElement[];
}

export const KineticTrack = forwardRef<KineticTrackHandle, {}>(
	(_props, ref) => {
		const trackRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => ({
			track: trackRef.current,
			blocks: trackRef.current
				? (gsap.utils.toArray(".kinetic-block") as HTMLElement[])
				: [],
			images: trackRef.current
				? (gsap.utils.toArray(".kinetic-block img") as HTMLElement[])
				: [],
		}));

		const sentence1 = [
			{ w: "At Studio+233," },
			{ w: "we" },
			{ w: "build" },
			{ w: "for" },
			{ w: "the" },
			{
				w: "purity",
				img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=600",
				idx: "01",
			},
			{ w: "of" },
			{
				w: "logic.",
				img: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600",
				idx: "02",
			},
		];

		const sentence2 = [
			{ w: "Restoring" },
			{ w: "the" },
			{
				w: "signal",
				img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
				idx: "03",
			},
			{ w: "to" },
			{ w: "the" },
			{
				w: "creative",
				img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
				idx: "04",
			},
			{
				w: "process.",
				img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
				idx: "05",
			},
		];

		return (
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
				<div
					ref={trackRef}
					className="flex flex-col gap-8 md:gap-12 items-center justify-center pointer-events-auto"
				>
					<div className="flex flex-wrap gap-4 justify-center">
						{sentence1.map((item, i) => (
							<HoverBlock
								key={`s1-${i}`}
								word={item.w}
								imageUrl={item.img}
								index={item.idx}
							/>
						))}
					</div>
					<div className="flex flex-wrap gap-4 justify-center">
						{sentence2.map((item, i) => (
							<HoverBlock
								key={`s2-${i}`}
								word={item.w}
								imageUrl={item.img}
								index={item.idx}
							/>
						))}
					</div>
				</div>
			</div>
		);
	},
);

KineticTrack.displayName = "KineticTrack";
