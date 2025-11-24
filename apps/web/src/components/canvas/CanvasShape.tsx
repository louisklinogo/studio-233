import React, { useEffect, useRef } from "react";
import {
	Arrow,
	Circle,
	Line,
	Rect,
	RegularPolygon,
	Transformer,
} from "react-konva";
import type { ShapeElement } from "@studio233/canvas";

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

			const updates: Partial<ShapeElement> = {
				x: node.x(),
				y: node.y(),
				width: Math.max(5, node.width() * scaleX),
				height: Math.max(5, node.height() * scaleY),
				rotation: node.rotation(),
			};

			if (element.points) {
				updates.points = element.points.map((p, i) => {
					return i % 2 === 0 ? p * scaleX : p * scaleY;
				});
			}

			onChange(updates);
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
					width={Math.abs(element.width)}
					height={Math.abs(element.height)}
					// Konva circle uses radius or width/height.
					// If using width/height, it acts like an ellipse if scaleX/Y are used or width!=height
				/>
			)}
			{element.shapeType === "triangle" && (
				<RegularPolygon
					{...commonProps}
					sides={3}
					radius={
						Math.min(Math.abs(element.width), Math.abs(element.height)) / 2
					}
					// Offset to center the triangle in the bounding box if needed,
					// but Konva RegularPolygon draws from center.
					// We might need to adjust x/y or offset to match rect/circle top-left origin behavior
					// For now, let's assume standard behavior.
					// Actually, Konva Rect/Circle (with width/height) usually draw from top-left?
					// No, Circle draws from center if radius is used, but if width/height is used it might differ.
					// Let's stick to simple implementation first.
					// To make it behave like a box (top-left origin), we might need offset.
					offsetX={-element.width / 2}
					offsetY={-element.height / 2}
				/>
			)}
			{element.shapeType === "arrow" && (
				<Arrow
					{...commonProps}
					points={
						element.points || [
							0,
							element.height / 2,
							element.width,
							element.height / 2,
						]
					}
					bezier={!!element.points}
					pointerLength={Math.min(20, Math.abs(element.width) * 0.3)}
					pointerWidth={Math.min(20, Math.abs(element.width) * 0.3)}
					fill={element.stroke} // Arrow head fill matches stroke
					stroke={element.stroke}
					strokeWidth={element.strokeWidth}
				/>
			)}
			{element.shapeType === "line" && (
				<Line
					{...commonProps}
					points={
						element.points || [
							0,
							element.height / 2,
							element.width,
							element.height / 2,
						]
					}
					bezier={!!element.points}
					lineCap="round"
					lineJoin="round"
					stroke={element.stroke}
					strokeWidth={element.strokeWidth}
				/>
			)}

			{/* Control Handles for Curved Lines/Arrows */}
			{isSelected && element.points && element.points.length === 6 && (
				<>
					{(() => {
						const updatePointsAndBounds = (
							pointIndex: number,
							newAbsX: number,
							newAbsY: number,
						) => {
							if (!element.points) return;

							// 1. Get all current absolute points
							const absPoints = [
								{
									x: element.x + element.points[0],
									y: element.y + element.points[1],
								}, // Start
								{
									x: element.x + element.points[2],
									y: element.y + element.points[3],
								}, // Control
								{
									x: element.x + element.points[4],
									y: element.y + element.points[5],
								}, // End
							];

							// 2. Update the moved point
							// pointIndex 0 -> Start (0), 1 -> Control (1), 2 -> End (2)
							// But the index passed in is likely 0, 2, 4 based on the array index.
							// Let's pass the array index (0, 2, 4) directly.
							const pIdx = pointIndex / 2;
							absPoints[pIdx] = { x: newAbsX, y: newAbsY };

							// 3. Calculate new Bounding Box
							const minX = Math.min(
								absPoints[0].x,
								absPoints[1].x,
								absPoints[2].x,
							);
							const minY = Math.min(
								absPoints[0].y,
								absPoints[1].y,
								absPoints[2].y,
							);
							const maxX = Math.max(
								absPoints[0].x,
								absPoints[1].x,
								absPoints[2].x,
							);
							const maxY = Math.max(
								absPoints[0].y,
								absPoints[1].y,
								absPoints[2].y,
							);

							const newX = minX;
							const newY = minY;
							const newWidth = Math.max(5, maxX - minX); // Ensure min width
							const newHeight = Math.max(5, maxY - minY); // Ensure min height

							// 4. Recalculate relative points
							const newPoints = [
								absPoints[0].x - newX,
								absPoints[0].y - newY,
								absPoints[1].x - newX,
								absPoints[1].y - newY,
								absPoints[2].x - newX,
								absPoints[2].y - newY,
							];

							onChange({
								x: newX,
								y: newY,
								width: newWidth,
								height: newHeight,
								points: newPoints,
							});
						};

						const handleCursorEnter = (e: any) => {
							const container = e.target.getStage()?.container();
							if (container) container.style.cursor = "pointer";
						};

						const handleCursorLeave = (e: any) => {
							const container = e.target.getStage()?.container();
							if (container) container.style.cursor = "default";
						};

						return (
							<>
								{/* Start Handle */}
								<Circle
									x={element.x + element.points[0]}
									y={element.y + element.points[1]}
									radius={6}
									fill="#3b82f6"
									stroke="#ffffff"
									strokeWidth={2}
									draggable
									onMouseEnter={handleCursorEnter}
									onMouseLeave={handleCursorLeave}
									onDragMove={(e) => {
										updatePointsAndBounds(0, e.target.x(), e.target.y());
									}}
								/>
								{/* Control Point Handle */}
								<Circle
									x={element.x + element.points[2]}
									y={element.y + element.points[3]}
									radius={6}
									fill="#ef4444"
									stroke="#ffffff"
									strokeWidth={2}
									draggable
									onMouseEnter={handleCursorEnter}
									onMouseLeave={handleCursorLeave}
									onDragMove={(e) => {
										updatePointsAndBounds(2, e.target.x(), e.target.y());
									}}
								/>
								{/* End Handle */}
								<Circle
									x={element.x + element.points[4]}
									y={element.y + element.points[5]}
									radius={6}
									fill="#3b82f6"
									stroke="#ffffff"
									strokeWidth={2}
									draggable
									onMouseEnter={handleCursorEnter}
									onMouseLeave={handleCursorLeave}
									onDragMove={(e) => {
										updatePointsAndBounds(4, e.target.x(), e.target.y());
									}}
								/>
								{/* Visual line connecting control point to start/end for better UX */}
								<Line
									points={[
										element.x + element.points[0],
										element.y + element.points[1],
										element.x + element.points[2],
										element.y + element.points[3],
										element.x + element.points[4],
										element.y + element.points[5],
									]}
									stroke="#94a3b8"
									strokeWidth={1}
									dash={[4, 4]}
									listening={false}
								/>
							</>
						);
					})()}
				</>
			)}

			{isSelected && !["line", "arrow"].includes(element.shapeType) && (
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
