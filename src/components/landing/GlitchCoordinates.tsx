"use client";

import React, { useEffect, useState } from "react";

export const GlitchCoordinates = () => {
	const [text, setText] = useState("LOC: 5.6037° N, 0.1870° W"); // Accra

	useEffect(() => {
		const target = "LOC: 5.6037° N, 0.1870° W";
		const chars = "0123456789.°-NW";

		const interval = setInterval(() => {
			let iteration = 0;
			const glitchInterval = setInterval(() => {
				setText((prev) =>
					target
						.split("")
						.map((char, i) => {
							if (i < 5) return char; // Keep "LOC: " stable
							if (i < iteration + 5) return target[i];
							return chars[Math.floor(Math.random() * chars.length)];
						})
						.join(""),
				);

				if (iteration >= target.length) {
					clearInterval(glitchInterval);
				}

				iteration += 1 / 2;
			}, 30);
		}, 5000); // Glitch every 5s

		return () => clearInterval(interval);
	}, []);

	return <p className="text-xs font-mono text-neutral-500">{text}</p>;
};
