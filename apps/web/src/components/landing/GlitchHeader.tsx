"use client";

import React, { useEffect, useState } from "react";

const OFFERINGS = [
	"GENERATE_MARKETING_CAMPAIGN_ASSETS",
	"BATCH_PROCESS_1000+_IMAGES",
	"TRANSFER_STYLE_FROM_REFERENCE_TO_100_IMAGES",
	"ISOLATE_PRODUCT_FROM_BG",
	"COMPOSITE_3D_SCENE",
	"DESIGN_EVENT_POSTER",
	"UPSCALE_AND_RESTORE",
	"DESIGN_FLYER_USING_THIS_TEMPLATE",
];

export const GlitchHeader = () => {
	const [text, setText] = useState(OFFERINGS[0]);
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			const nextIndex = (index + 1) % OFFERINGS.length;
			setIndex(nextIndex);

			const nextWord = OFFERINGS[nextIndex];
			let iteration = 0;

			const glitchInterval = setInterval(() => {
				setText((prev) =>
					nextWord
						.split("")
						.map((char, i) => {
							if (i < iteration) return nextWord[i];
							return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&_"[
								Math.floor(Math.random() * 36)
							];
						})
						.join(""),
				);

				if (iteration >= nextWord.length) {
					clearInterval(glitchInterval);
				}

				iteration += 1 / 3; // Speed of decryption
			}, 30);
		}, 4000); // Cycle every 4 seconds

		return () => clearInterval(interval);
	}, [index]);

	return (
		<div>
			<p className="text-xs font-mono text-[#FF4D00] h-4">{`> ${text}`}</p>
		</div>
	);
};
