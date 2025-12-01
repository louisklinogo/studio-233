import type { DrawingElement } from "@studio233/canvas";
import React, { useEffect, useRef } from "react";
import { Line, Transformer } from "react-konva";

interface CanvasDrawingProps {
	element: DrawingElement;
	isSelected: boolean;
	onSelect: () => void;
	onChange: (newAttrs: Partial<DrawingElement>) => void;
	isDraggable: boolean;
}

export const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
	element,
	isSelected,
	onSelect,
	onChange,
	isDraggable,
}) => {
	const shapeRef = useRef<any>(null);
	const trRef = useRef<any>(null);

	useEffect(() => {
		if (isSelected && trRef.current && shapeRef.current) {
			trRef.current.nodes([shapeRef.current]);
			trRef.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	return (
		<>
			<Line
				ref={shapeRef}
				points={element.points}
				stroke={element.stroke}
				strokeWidth={element.strokeWidth}
				tension={element.tension || 0.5}
				lineCap={element.lineCap || "round"}
				lineJoin={element.lineJoin || "round"}
				x={element.x}
				y={element.y}
				rotation={element.rotation}
				opacity={element.opacity}
				visible={element.isVisible}
				draggable={isDraggable}
				onClick={onSelect}
				onTap={onSelect}
				onDragEnd={(e) => {
					onChange({
						x: e.target.x(),
						y: e.target.y(),
					});
				}}
				onTransformEnd={(e) => {
					const node = shapeRef.current;
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();

					// Reset scale
					node.scaleX(1);
					node.scaleY(1);

					// Bake scale into points
					const newPoints = element.points.map((val, i) => {
						return i % 2 === 0 ? val * scaleX : val * scaleY;
					});

					onChange({
						x: node.x(),
						y: node.y(),
						rotation: node.rotation(),
						points: newPoints,
					});
				}}
			/>
			{isSelected && (
				<Transformer
					ref={trRef}
					enabledAnchors={[
						"top-left",
						"top-right",
						"bottom-left",
						"bottom-right",
					]}
					anchorSize={6}
					anchorCornerRadius={0}
					anchorStrokeWidth={0}
					anchorFill="#ffffff"
					borderStroke="#FF4D00"
					borderStrokeWidth={1}
					boundBoxFunc={(oldBox, newBox) => {
						if (newBox.width < 5 || newBox.height < 5) {
							return oldBox;
						}
						return newBox;
					}}
				/>
			)}
		</>
	);
};
