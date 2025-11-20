import React, { useEffect, useRef } from "react";
import { Circle, Rect, RegularPolygon, Star, Transformer } from "react-konva";
import type { ShapeElement } from "@/types/elements";

interface CanvasShapeProps {
	element: ShapeElement;
	isSelected: boolean;
	onSelect: () => void;
	onChange: (newAttrs: Partial<ShapeElement>) => void;
	isDraggable: boolean;
}

export const CanvasShape: React.FC<CanvasShapeProps> = ({
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

	const commonProps = {
		ref: shapeRef,
		x: element.x,
		y: element.y,
		rotation: element.rotation,
		fill: element.fill,
		stroke: element.stroke,
		strokeWidth: element.strokeWidth,
		opacity: element.opacity,
		visible: element.isVisible,
		draggable: isDraggable,
		onClick: onSelect,
		onTap: onSelect,
		onDragEnd: (e: any) => {
			onChange({
				x: e.target.x(),
				y: e.target.y(),
			});
		},
		onTransformEnd: (e: any) => {
			const node = shapeRef.current;
			const scaleX = node.scaleX();
			const scaleY = node.scaleY();

			// Reset scale
			node.scaleX(1);
			node.scaleY(1);

			onChange({
				x: node.x(),
				y: node.y(),
				width: Math.max(5, node.width() * scaleX),
				height: Math.max(5, node.height() * scaleY),
				rotation: node.rotation(),
			});
		},
	};

	return (
		<>
			{element.shapeType === "rect" && (
				<Rect
					{...commonProps}
					width={element.width}
					height={element.height}
					cornerRadius={element.cornerRadius}
				/>
			)}
			{element.shapeType === "circle" && (
				<Circle
					{...commonProps}
					width={element.width}
					height={element.height}
					// Konva circle uses radius or width/height.
					// If using width/height, it acts like an ellipse if scaleX/Y are used or width!=height
				/>
			)}
			{/* Add support for other shapes if needed */}

			{isSelected && (
				<Transformer
					ref={trRef}
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
