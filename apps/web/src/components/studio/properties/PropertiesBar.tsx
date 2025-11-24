import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	ArrowRight,
	Bold,
	Circle,
	Copy,
	Italic,
	Minus,
	Pencil,
	Square,
	Star,
	Trash2,
	Triangle,
	Type,
	Underline,
} from "lucide-react";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
	CanvasElement,
	DrawingElement,
	ShapeElement,
	TextElement,
} from "@studio233/canvas";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { FontSelector } from "./FontSelector";
import { FontSizeSelector } from "./FontSizeSelector";
import { PropertySlider } from "./PropertySlider";

interface PropertiesBarProps {
	elements: CanvasElement[];
	selectedIds: string[];
	updateElement: (id: string, updates: Partial<CanvasElement>) => void;
	onDelete?: () => void;
	onDuplicate?: () => void;

	activeTool?: string;
	defaultTextProps?: any;
	setDefaultTextProps?: (props: any) => void;
	defaultShapeProps?: any;
	setDefaultShapeProps?: (props: any) => void;
	defaultDrawingProps?: any;
	setDefaultDrawingProps?: (props: any) => void;
}

export const PropertiesBar: React.FC<PropertiesBarProps> = ({
	elements,
	selectedIds,
	updateElement,
	onDelete,
	onDuplicate,
	activeTool,
	defaultTextProps,
	setDefaultTextProps,
	defaultShapeProps,
	setDefaultShapeProps,
	defaultDrawingProps,
	setDefaultDrawingProps,
}) => {
	const selectedElement = useMemo(() => {
		if (selectedIds.length !== 1) return null;
		return elements.find((el) => el.id === selectedIds[0]);
	}, [elements, selectedIds]);

	const showToolProperties =
		!selectedElement && ["text", "shape", "draw"].includes(activeTool || "");

	// Helper to update the current element OR default props
	const isToolMode = !selectedElement;

	return selectedElement || showToolProperties ? (
		<div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md border shadow-lg rounded-xl p-2 flex items-center gap-4 z-30 animate-in fade-in slide-in-from-top-2 max-w-[90vw] overflow-x-auto">
			{!isToolMode && (
				<>
					{/* Common Actions only for selected items */}
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={onDuplicate}
						>
							<Copy className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={onDelete}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
					<Separator orientation="vertical" className="h-8" />
				</>
			)}

			{/* Text Properties */}
			{(selectedElement?.type === "text" ||
				(isToolMode && activeTool === "text")) && (
				<>
					<div className="flex items-center gap-2 min-w-[120px]">
						<FontSelector
							value={
								isToolMode
									? defaultTextProps?.fontFamily
									: (selectedElement as TextElement).fontFamily
							}
							onChange={(val) =>
								isToolMode
									? setDefaultTextProps?.({
											...defaultTextProps,
											fontFamily: val,
										})
									: updateElement(selectedElement!.id, {
											fontFamily: val,
										} as Partial<TextElement>)
							}
						/>
					</div>

					<Separator orientation="vertical" className="h-8" />

					<div className="w-[70px]">
						<FontSizeSelector
							value={
								isToolMode
									? defaultTextProps?.fontSize
									: (selectedElement as TextElement).fontSize
							}
							onChange={(val) =>
								isToolMode
									? setDefaultTextProps?.({
											...defaultTextProps,
											fontSize: val,
										})
									: updateElement(selectedElement!.id, {
											fontSize: val,
										} as Partial<TextElement>)
							}
						/>
					</div>

					<Separator orientation="vertical" className="h-8" />

					<ColorPickerPopover
						color={
							isToolMode
								? defaultTextProps?.fill
								: (selectedElement as TextElement).fill
						}
						onChange={(c) =>
							isToolMode
								? setDefaultTextProps?.({ ...defaultTextProps, fill: c })
								: updateElement(selectedElement!.id, {
										fill: c,
									} as Partial<TextElement>)
						}
					/>
				</>
			)}

			{/* Shape Properties */}
			{(selectedElement?.type === "shape" ||
				(isToolMode && activeTool === "shape")) && (
				<>
					{/* Shape Type Selector */}
					<ToggleGroup
						type="single"
						value={
							isToolMode
								? defaultShapeProps?.shapeType
								: (selectedElement as ShapeElement).shapeType
						}
						onValueChange={(val) => {
							if (!val) return;
							isToolMode
								? setDefaultShapeProps?.({
										...defaultShapeProps,
										shapeType: val,
									})
								: updateElement(selectedElement!.id, {
										shapeType: val as any,
									} as Partial<ShapeElement>);
						}}
					>
						<ToggleGroupItem
							value="rect"
							size="sm"
							className="h-8 w-8 p-0"
							title="Rectangle"
						>
							<Square className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="circle"
							size="sm"
							className="h-8 w-8 p-0"
							title="Circle"
						>
							<Circle className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="triangle"
							size="sm"
							className="h-8 w-8 p-0"
							title="Triangle"
						>
							<Triangle className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="arrow"
							size="sm"
							className="h-8 w-8 p-0"
							title="Arrow"
						>
							<ArrowRight className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="line"
							size="sm"
							className="h-8 w-8 p-0"
							title="Line"
						>
							<Minus className="h-4 w-4" />
						</ToggleGroupItem>
					</ToggleGroup>

					<Separator orientation="vertical" className="h-8" />

					<ColorPickerPopover
						label="Fill"
						color={
							isToolMode
								? defaultShapeProps?.fill
								: (selectedElement as ShapeElement).fill
						}
						onChange={(c) =>
							isToolMode
								? setDefaultShapeProps?.({ ...defaultShapeProps, fill: c })
								: updateElement(selectedElement!.id, {
										fill: c,
									} as Partial<ShapeElement>)
						}
					/>

					<Separator orientation="vertical" className="h-8" />

					<ColorPickerPopover
						label="Stroke"
						color={
							isToolMode
								? defaultShapeProps?.stroke
								: (selectedElement as ShapeElement).stroke
						}
						onChange={(c) =>
							isToolMode
								? setDefaultShapeProps?.({ ...defaultShapeProps, stroke: c })
								: updateElement(selectedElement!.id, {
										stroke: c,
									} as Partial<ShapeElement>)
						}
					/>

					<div className="w-24">
						<PropertySlider
							label="Width"
							value={
								isToolMode
									? defaultShapeProps?.strokeWidth
									: (selectedElement as ShapeElement).strokeWidth
							}
							min={0}
							max={20}
							onChange={(v) =>
								isToolMode
									? setDefaultShapeProps?.({
											...defaultShapeProps,
											strokeWidth: v,
										})
									: updateElement(selectedElement!.id, {
											strokeWidth: v,
										} as Partial<ShapeElement>)
							}
						/>
					</div>

					{(isToolMode
						? defaultShapeProps?.shapeType
						: (selectedElement as ShapeElement).shapeType) === "rect" && (
						<div className="w-24">
							<PropertySlider
								label="Radius"
								value={
									isToolMode
										? defaultShapeProps?.cornerRadius
										: (selectedElement as ShapeElement).cornerRadius || 0
								}
								min={0}
								max={100}
								onChange={(v) =>
									isToolMode
										? setDefaultShapeProps?.({
												...defaultShapeProps,
												cornerRadius: v,
											})
										: updateElement(selectedElement!.id, {
												cornerRadius: v,
											} as Partial<ShapeElement>)
								}
							/>
						</div>
					)}
				</>
			)}

			{/* Drawing Properties */}
			{(selectedElement?.type === "drawing" ||
				(isToolMode && activeTool === "draw")) && (
				<>
					<ColorPickerPopover
						label="Color"
						color={
							isToolMode
								? defaultDrawingProps?.stroke
								: (selectedElement as DrawingElement).stroke
						}
						onChange={(c) =>
							isToolMode
								? setDefaultDrawingProps?.({
										...defaultDrawingProps,
										stroke: c,
									})
								: updateElement(selectedElement!.id, {
										stroke: c,
									} as Partial<DrawingElement>)
						}
					/>

					<Separator orientation="vertical" className="h-8" />

					<div className="w-24">
						<PropertySlider
							label="Thickness"
							value={
								isToolMode
									? defaultDrawingProps?.strokeWidth
									: (selectedElement as DrawingElement).strokeWidth
							}
							min={1}
							max={50}
							onChange={(v) =>
								isToolMode
									? setDefaultDrawingProps?.({
											...defaultDrawingProps,
											strokeWidth: v,
										})
									: updateElement(selectedElement!.id, {
											strokeWidth: v,
										} as Partial<DrawingElement>)
							}
						/>
					</div>

					<div className="w-24">
						<PropertySlider
							label="Smoothing"
							value={
								isToolMode
									? defaultDrawingProps?.tension
									: (selectedElement as DrawingElement).tension || 0.5
							}
							min={0}
							max={1}
							step={0.1}
							onChange={(v) =>
								isToolMode
									? setDefaultDrawingProps?.({
											...defaultDrawingProps,
											tension: v,
										})
									: updateElement(selectedElement!.id, {
											tension: v,
										} as Partial<DrawingElement>)
							}
						/>
					</div>
				</>
			)}

			{!isToolMode && (
				<>
					<Separator orientation="vertical" className="h-8" />
					<div className="w-24">
						<PropertySlider
							label="Opacity"
							value={Math.round((selectedElement!.opacity || 1) * 100)}
							min={0}
							max={100}
							onChange={(v) =>
								updateElement(selectedElement!.id, { opacity: v / 100 })
							}
						/>
					</div>
				</>
			)}
		</div>
	) : null;
};
