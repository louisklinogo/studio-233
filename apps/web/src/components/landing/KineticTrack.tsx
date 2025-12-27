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

	return (
		<div
			onMouseEnter={() => isInteractive && setIsHovered(true)}
			onMouseLeave={() => isInteractive && setIsHovered(false)}
			className={`
                kinetic-block relative overflow-hidden px-4 py-2 sm:px-8 sm:py-4 bg-[#f4f4f0] border transition-colors duration-500
                ${isInteractive ? "cursor-switch" : "cursor-default"}
                ${isHovered ? "border-[#D81E05] z-10" : "border-neutral-300"}
                ${className || ""}
            `}
		>
			<div className="relative z-20">
				<span
					className={`
                    kinetic-text inline-block will-change-transform
                    text-4xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-none
                    ${isHovered && isInteractive ? "text-[#D81E05]" : "text-black"}
                    transition-colors duration-300
                `}
				>
					{word}
				</span>
			</div>

			{isInteractive && (
				<div
					className={`absolute top-1 right-1 w-1.5 h-1.5 transition-colors duration-300 ${isHovered ? "bg-[#D81E05]" : "bg-neutral-800"}`}
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
						className={`w-full h-full object-cover grayscale transition-transform duration-700 ${isHovered ? "scale-100" : "scale-125"}`}
						alt=""
					/>
					<div className="absolute inset-0 bg-[#D81E05] mix-blend-multiply opacity-20" />
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
}

export const KineticTrack = forwardRef<KineticTrackHandle, {}>(
	(_props, ref) => {
		const trackRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => ({
			track: trackRef.current,
			blocks: trackRef.current
				? (gsap.utils.toArray(".kinetic-block") as HTMLElement[])
				: [],
		}));

		const sentence1 = [
			{ w: "We" },
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
			<div className="absolute inset-0 flex items-center pointer-events-none">
				<div
					ref={trackRef}
					className="flex flex-nowrap gap-12 md:gap-24 px-[50vw] items-center pointer-events-auto"
				>
					{sentence1.map((item, i) => (
						<HoverBlock
							key={`s1-${i}`}
							word={item.w}
							imageUrl={item.img}
							index={item.idx}
						/>
					))}
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
		);
	},
);

KineticTrack.displayName = "KineticTrack";
