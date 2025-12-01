import type { TextElement } from "@studio233/canvas";
import React, { useEffect, useRef, useState } from "react";
import { Text, Transformer } from "react-konva";
import { Html } from "react-konva-utils";

interface CanvasTextProps {
	element: TextElement;
	isSelected: boolean;
	onSelect: () => void;
	onChange: (newAttrs: Partial<TextElement>) => void;
	isDraggable: boolean;
	autoFocus?: boolean;
}

export const CanvasText: React.FC<CanvasTextProps> = ({
	element,
	isSelected,
	onSelect,
	onChange,
	isDraggable,
	autoFocus,
}) => {
	const shapeRef = useRef<any>(null);
	const trRef = useRef<any>(null);
	const [isEditing, setIsEditing] = useState(false);

	// Handle autoFocus
	useEffect(() => {
		if (autoFocus && isSelected) {
			setIsEditing(true);
		}
	}, [autoFocus, isSelected]);

	useEffect(() => {
		if (isSelected && trRef.current && shapeRef.current) {
			trRef.current.nodes([shapeRef.current]);
			trRef.current.getLayer().batchDraw();
		}
	}, [isSelected]);

	// Auto-focus textarea when editing starts
	useEffect(() => {
		if (isEditing) {
			// Small timeout to ensure render
			setTimeout(() => {
				const textarea = document.getElementById(
					`text-edit-${element.id}`,
				) as HTMLTextAreaElement;
				if (textarea) {
					textarea.focus();
					textarea.select();
				}
			}, 50);
		}
	}, [isEditing, element.id]);

	const handleDblClick = () => {
		setIsEditing(true);
	};

	const handleBlur = () => {
		setIsEditing(false);
	};

	return (
		<>
			<Text
				ref={shapeRef}
				text={element.content}
				x={element.x}
				y={element.y}
				width={element.width}
				rotation={element.rotation}
				fontSize={element.fontSize}
				fontFamily={element.fontFamily}
				fill={element.fill}
				align={element.align}
				fontStyle={element.fontStyle}
				textDecoration={element.textDecoration}
				opacity={isEditing ? 0 : element.opacity}
				visible={element.isVisible}
				draggable={isDraggable && !isEditing}
				onClick={onSelect}
				onTap={onSelect}
				onDblClick={handleDblClick}
				onDblTap={handleDblClick}
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

					// Reset scale and update width/fontSize
					node.scaleX(1);
					node.scaleY(1);

					onChange({
						x: node.x(),
						y: node.y(),
						width: Math.max(5, node.width() * scaleX),
						rotation: node.rotation(),
						fontSize: element.fontSize * scaleY, // simple scaling for now
					});
				}}
			/>
			{isSelected && !isEditing && (
				<Transformer
					ref={trRef}
					boundBoxFunc={(oldBox, newBox) => {
						newBox.width = Math.max(30, newBox.width);
						return newBox;
					}}
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
					rotateAnchorOffset={10}
				/>
			)}
			{isEditing && (
				<Html
					groupProps={{ x: element.x, y: element.y }}
					divProps={{ style: { opacity: 1 } }}
				>
					<textarea
						id={`text-edit-${element.id}`}
						value={element.content}
						onChange={(e) => onChange({ content: e.target.value })}
						onBlur={handleBlur}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setIsEditing(false);
							}
						}}
						style={{
							width: `${element.width}px`,
							height: "auto",
							fontSize: `${element.fontSize}px`,
							fontFamily: element.fontFamily,
							color: element.fill,
							border: "none",
							padding: "0px",
							margin: "0px",
							background: "transparent",
							outline: "none",
							resize: "none",
							lineHeight: 1,
							overflow: "hidden",
							textAlign: element.align,
							transform: `rotate(${element.rotation}deg)`,
							transformOrigin: "top left",
						}}
					/>
				</Html>
			)}
		</>
	);
};
