"use client";

import React, { useEffect, useState } from "react";

interface GlitchTextProps {
	text: string;
	className?: string;
	trigger?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
	text,
	className,
	trigger = false,
}) => {
	const [renderData, setRenderData] = useState({
		resolved: text,
		glitched: "",
	});

	useEffect(() => {
		if (!trigger) {
			setRenderData({ resolved: text, glitched: "" });
			return;
		}

		let iteration = 0;
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&_";

		const interval = setInterval(() => {
			const index = Math.floor(iteration);
			const remaining = text.length - index;

			const randomStr = Array.from({ length: remaining })
				.map(() => chars[Math.floor(Math.random() * chars.length)])
				.join("");

			setRenderData({
				resolved: text.slice(0, index),
				glitched: randomStr,
			});

			if (iteration >= text.length) {
				clearInterval(interval);
			}

			iteration += 2; // Much faster (was 0.5)
		}, 30);

		return () => clearInterval(interval);
	}, [text, trigger]);

	return (
		<span className={className}>
			<span>{renderData.resolved}</span>
			<span className="text-[#FF4D00]">{renderData.glitched}</span>
		</span>
	);
};
