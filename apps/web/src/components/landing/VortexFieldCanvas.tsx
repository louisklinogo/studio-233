"use client";

import React, { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";

export const VortexFieldCanvas: React.FC<{
	camera: { x: number; y: number; scale: number };
}> = ({ camera }) => {
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		setDimensions({ width: window.innerWidth, height: window.innerHeight });
	}, []);

	return dimensions.width === 0 ? null : (
		<Stage
			width={dimensions.width}
			height={dimensions.height}
			x={camera.x + dimensions.width / 2}
			y={camera.y + dimensions.height / 2}
			scaleX={camera.scale}
			scaleY={camera.scale}
			className="z-0"
		>
			<Layer>
				{/* Background Grid Dots */}
				{Array.from({ length: 100 }).map((_, i) => (
					<Rect
						key={i}
						x={(i % 10) * 200 - 1000}
						y={Math.floor(i / 10) * 200 - 1000}
						width={1}
						height={1}
						fill="#ccc"
					/>
				))}

				{/* Mock Assets (Monoliths) */}
				{[0, 1, 2].map((i) => (
					<React.Fragment key={i}>
						<Rect
							x={i * 300 - 300}
							y={-100}
							width={200}
							height={300}
							fill="#fff"
							stroke="#0f172a"
							strokeWidth={2}
							cornerRadius={1}
							shadowColor="black"
							shadowBlur={20}
							shadowOpacity={0.05}
						/>
						{/* Selection Transformer (Always visible on center one for demo) */}
						{i === 1 && (
							<Rect
								x={-100}
								y={-100}
								width={200}
								height={300}
								stroke="#FF4D00"
								strokeWidth={1}
							/>
						)}
					</React.Fragment>
				))}
			</Layer>
		</Stage>
	);
};
