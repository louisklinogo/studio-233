import type {
	CanvasElement,
	DrawingElement,
	PlacedImage,
	PlacedVideo,
	SelectionBox,
	ShapeElement,
	TextElement,
} from "@studio233/canvas";
import Konva from "konva";
import React, { useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { CanvasDrawing } from "@/components/canvas/CanvasDrawing";
import { CanvasGrid } from "@/components/canvas/CanvasGrid";
import { CanvasImage } from "@/components/canvas/CanvasImage";
import { CanvasShape } from "@/components/canvas/CanvasShape";
import { CanvasText } from "@/components/canvas/CanvasText";
import { CanvasVideo } from "@/components/canvas/CanvasVideo";
import { CropOverlayWrapper } from "@/components/canvas/CropOverlayWrapper";
import { SelectionBoxComponent } from "@/components/canvas/SelectionBox";
import type { ViewportState } from "@/hooks/useViewportState";
import { createCroppedImage } from "@/utils/image-processing";

interface CanvasStageProps {
	canvasSize: { width: number; height: number };
	viewport: ViewportState;
	isCanvasReady: boolean;
	stageRef: React.RefObject<Konva.Stage | null>;
	images: PlacedImage[];
	videos: PlacedVideo[];
	// New elements
	elements: CanvasElement[];
	selectedIds: string[];
	selectionBox: SelectionBox;
	isSelecting: boolean;
	showGrid: boolean;
	gridSize: number;
	isPanningCanvas: boolean;
	croppingImageId: string | null;
	dragStartPositions: Map<string, { x: number; y: number }>;
	isDraggingImage: boolean;
	activeTool: string;

	// Default props for new elements
	defaultTextProps?: {
		fontFamily: string;
		fontSize: number;
		fill: string;
		align: "left" | "center" | "right";
	};
	defaultShapeProps?: {
		fill: string;
		stroke: string;
		strokeWidth: number;
		cornerRadius: number;
		shapeType: ShapeElement["shapeType"];
	};
	defaultDrawingProps?: {
		stroke: string;
		strokeWidth: number;
		tension: number;
	};

	// State setters
	setImages: React.Dispatch<React.SetStateAction<PlacedImage[]>>;
	setVideos: React.Dispatch<React.SetStateAction<PlacedVideo[]>>;
	// New element setters
	setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
	setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
	setIsDraggingImage: (isDragging: boolean) => void;
	setHiddenVideoControlsIds: React.Dispatch<React.SetStateAction<Set<string>>>;
	setDragStartPositions: (
		positions: Map<string, { x: number; y: number }>,
	) => void;
	setCroppingImageId: (id: string | null) => void;
	saveToHistory: () => void;
	setActiveTool: (tool: any) => void;

	// Event handlers
	onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseLeave: () => void;
	onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
	onTouchStart: (e: Konva.KonvaEventObject<TouchEvent>) => void;
	onTouchMove: (e: Konva.KonvaEventObject<TouchEvent>) => void;
	onTouchEnd: (e: Konva.KonvaEventObject<TouchEvent>) => void;
	onContextMenu?: (e: Konva.KonvaEventObject<PointerEvent>) => void;
	handleSelect: (
		id: string,
		e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
	) => void;
}

export const CanvasStage = React.forwardRef<HTMLDivElement, CanvasStageProps>(
	(
		{
			canvasSize,
			viewport,
			isCanvasReady,
			stageRef,
			images,
			videos,
			elements,
			selectedIds,
			selectionBox,
			isSelecting,
			showGrid,
			gridSize,
			isPanningCanvas,
			croppingImageId,
			dragStartPositions,
			isDraggingImage,
			activeTool,
			setImages,
			setVideos,
			setElements,
			setSelectedIds,
			setIsDraggingImage,
			setHiddenVideoControlsIds,
			setDragStartPositions,
			setCroppingImageId,
			saveToHistory,
			setActiveTool,
			defaultTextProps,
			defaultShapeProps,
			defaultDrawingProps,
			onMouseDown,
			onMouseMove,
			onMouseUp,
			onMouseLeave,
			onWheel,
			onTouchStart,
			onTouchMove,
			onTouchEnd,
			onContextMenu,
			handleSelect,
		},
		ref,
	) => {
		// Local state for drawing interactions
		const [isDrawing, setIsDrawing] = useState(false);
		const [currentShapeId, setCurrentShapeId] = useState<string | null>(null);
		const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(
			null,
		);
		const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

		// Clear justCreatedId when selection changes
		React.useEffect(() => {
			if (
				justCreatedId &&
				(!selectedIds.includes(justCreatedId) || selectedIds.length === 0)
			) {
				setJustCreatedId(null);
			}
		}, [selectedIds, justCreatedId]);

		// Helper to get pointer position relative to canvas
		const getPointerPos = () => {
			const stage = stageRef.current;
			if (!stage) return { x: 0, y: 0 };
			const pointer = stage.getPointerPosition();
			if (!pointer) return { x: 0, y: 0 };
			return {
				x: (pointer.x - viewport.x) / viewport.scale,
				y: (pointer.y - viewport.y) / viewport.scale,
			};
		};

		const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
			// Delegate to parent handler first (for panning/selection)
			onMouseDown(e);

			if (activeTool === "select" || activeTool === "pan") return;

			const pos = getPointerPos();

			if (activeTool === "text") {
				// Click-to-type interaction
				const newText: TextElement = {
					id: crypto.randomUUID(),
					type: "text",
					x: pos.x,
					y: pos.y,
					width: 200,
					height: 50,
					rotation: 0,
					opacity: 1,
					isVisible: true,
					isLocked: false,
					zIndex: 10,
					content: "Type here...",
					fontFamily: "Inter",
					fontSize: 24,
					fill: "#000000",
					align: "left",
					...defaultTextProps,
				};
				setElements((prev) => [...prev, newText]);
				setSelectedIds([newText.id]);
				setJustCreatedId(newText.id);

				// Switch back to select tool after creating text (standard behavior? or stay in text mode?)
				// Figma stays in text mode until you click away or finish.
				// For now let's set tool to select so user can edit immediately.
				setActiveTool("select");
				saveToHistory();
			} else if (activeTool === "shape") {
				setIsDrawing(true);
				const newShape: ShapeElement = {
					id: crypto.randomUUID(),
					type: "shape",
					x: pos.x,
					y: pos.y,
					width: 0, // Start with 0 width
					height: 0,
					rotation: 0,
					opacity: 1,
					isVisible: true,
					isLocked: false,
					zIndex: 10,
					shapeType: "rect", // Default to rect
					fill: "#e2e8f0",
					stroke: "#64748b",
					strokeWidth: 2,
					cornerRadius: 0,
					...defaultShapeProps,
				};

				// Initialize points for line/arrow
				if (newShape.shapeType === "line" || newShape.shapeType === "arrow") {
					newShape.points = [0, 0, 0, 0, 0, 0];
				}

				setElements((prev) => [...prev, newShape]);
				setCurrentShapeId(newShape.id);
			} else if (activeTool === "draw") {
				setIsDrawing(true);
				const newDrawing: DrawingElement = {
					id: crypto.randomUUID(),
					type: "drawing",
					x: 0, // Points are absolute or relative? Usually points are relative to Group or absolute on Layer.
					// Let's use 0,0 and absolute points for now, simpler.
					y: 0,
					rotation: 0,
					width: 0, // Bounding box update later
					height: 0,
					opacity: 1,
					isVisible: true,
					isLocked: false,
					zIndex: 10,
					points: [pos.x, pos.y],
					stroke: "#000000",
					strokeWidth: 3,
					tension: 0.5,
					lineCap: "round",
					lineJoin: "round",
					...defaultDrawingProps,
				};
				setElements((prev) => [...prev, newDrawing]);
				setCurrentDrawingId(newDrawing.id);
			}
		};

		const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
			onMouseMove(e);

			if (!isDrawing) return;
			const pos = getPointerPos();

			if (activeTool === "shape" && currentShapeId) {
				setElements((prev) =>
					prev.map((el) => {
						if (el.id === currentShapeId && el.type === "shape") {
							const startX = el.x; // This was set on MouseDown
							const startY = el.y; // This might be wrong if we update x/y.
							// Actually, creating from corner:
							// x/y is start point. width/height is delta.
							// But creating from center vs corner?
							// Let's assume corner dragging.
							// If width is negative, flip?
							// Konva Rect allows negative width/height? Yes.
							// Konva Rect allows negative width/height? Yes.
							const width = pos.x - el.x;
							const height = pos.y - el.y;

							const updates: Partial<ShapeElement> = {
								width,
								height,
							};

							// Update points for line/arrow
							if (
								(el.shapeType === "line" || el.shapeType === "arrow") &&
								el.points
							) {
								updates.points = [0, 0, width / 2, height / 2, width, height];
							}

							return {
								...el,
								...updates,
							};
						}
						return el;
					}),
				);
			} else if (activeTool === "draw" && currentDrawingId) {
				setElements((prev) =>
					prev.map((el) => {
						if (el.id === currentDrawingId && el.type === "drawing") {
							return {
								...el,
								points: [...el.points, pos.x, pos.y],
							};
						}
						return el;
					}),
				);
			}
		};

		const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
			onMouseUp(e);
			if (isDrawing) {
				setIsDrawing(false);

				// Normalize shape dimensions if needed
				if (currentShapeId) {
					setElements((prev) =>
						prev.map((el) => {
							if (el.id === currentShapeId && el.type === "shape") {
								let { x, y, width, height } = el;

								// Normalize negative width/height
								let points = el.points ? [...el.points] : undefined;

								if (width < 0) {
									x += width;
									// Shift points if they exist
									if (points) {
										for (let i = 0; i < points.length; i += 2) {
											points[i] -= width;
										}
									}
									width = Math.abs(width);
								}
								if (height < 0) {
									y += height;
									// Shift points if they exist
									if (points) {
										for (let i = 1; i < points.length; i += 2) {
											points[i] -= height;
										}
									}
									height = Math.abs(height);
								}

								return {
									...el,
									x,
									y,
									width,
									height,
									points,
								};
							}
							return el;
						}),
					);
					setSelectedIds([currentShapeId]);
				}

				if (currentDrawingId) setSelectedIds([currentDrawingId]);

				setCurrentShapeId(null);
				setCurrentDrawingId(null);

				saveToHistory();
			}
		};

		return (
			<div
				ref={ref}
				className="relative bg-transparent overflow-hidden w-full h-full"
				style={{
					height: `${canvasSize.height}px`,
					width: `${canvasSize.width}px`,
					minHeight: `${canvasSize.height}px`,
					minWidth: `${canvasSize.width}px`,
					cursor: isPanningCanvas
						? "grabbing"
						: activeTool === "text"
							? "text"
							: activeTool === "draw" || activeTool === "shape"
								? "crosshair"
								: "default",
					WebkitTouchCallout: "none",
					touchAction: "none",
				}}
			>
				{isCanvasReady && (
					<Stage
						ref={stageRef}
						width={canvasSize.width}
						height={canvasSize.height}
						x={viewport.x}
						y={viewport.y}
						scaleX={viewport.scale}
						scaleY={viewport.scale}
						draggable={false}
						onDragStart={(e) => {
							e.evt?.preventDefault();
						}}
						onDragEnd={(e) => {
							e.evt?.preventDefault();
						}}
						onMouseDown={handleStageMouseDown}
						onMouseMove={handleStageMouseMove}
						onMouseUp={handleStageMouseUp}
						onMouseLeave={onMouseLeave}
						onWheel={onWheel}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onTouchEnd={onTouchEnd}
						onContextMenu={onContextMenu}
					>
						<Layer>
							{showGrid && (
								<CanvasGrid
									viewport={viewport}
									canvasSize={canvasSize}
									gridSize={gridSize}
								/>
							)}

							<SelectionBoxComponent selectionBox={selectionBox} />

							{/* Images */}
							{images.map((image) => (
								<CanvasImage
									key={image.id}
									image={image}
									isSelected={selectedIds.includes(image.id)}
									onSelect={(e) => handleSelect(image.id, e)}
									onChange={(newAttrs) => {
										setImages((prev) =>
											prev.map((img) =>
												img.id === image.id ? { ...img, ...newAttrs } : img,
											),
										);
									}}
									onDragStart={() => {
										let currentSelectedIds = selectedIds;
										if (!selectedIds.includes(image.id)) {
											currentSelectedIds = [image.id];
											setSelectedIds(currentSelectedIds);
										}

										setIsDraggingImage(true);
										const positions = new Map<
											string,
											{ x: number; y: number }
										>();
										currentSelectedIds.forEach((id) => {
											const img = images.find((i) => i.id === id);
											if (img) {
												positions.set(id, { x: img.x, y: img.y });
											}
										});
										setDragStartPositions(positions);
									}}
									onDragEnd={() => {
										setIsDraggingImage(false);
										saveToHistory();
										setDragStartPositions(new Map());
									}}
									selectedIds={selectedIds}
									images={images}
									setImages={setImages}
									isDraggingImage={isDraggingImage}
									isCroppingImage={croppingImageId === image.id}
									dragStartPositions={dragStartPositions}
								/>
							))}

							{/* Videos */}
							{videos
								.sort((a, b) => {
									const aSelected = selectedIds.includes(a.id);
									const bSelected = selectedIds.includes(b.id);
									if (aSelected && !bSelected) return 1;
									if (!aSelected && bSelected) return -1;
									return 0;
								})
								.map((video) => (
									<CanvasVideo
										key={video.id}
										video={video}
										isSelected={selectedIds.includes(video.id)}
										onSelect={(e) => handleSelect(video.id, e)}
										onChange={(newAttrs) => {
											setVideos((prev) =>
												prev.map((vid) =>
													vid.id === video.id ? { ...vid, ...newAttrs } : vid,
												),
											);
										}}
										onDragStart={() => {
											let currentSelectedIds = selectedIds;
											if (!selectedIds.includes(video.id)) {
												currentSelectedIds = [video.id];
												setSelectedIds(currentSelectedIds);
											}

											setIsDraggingImage(true);
											setHiddenVideoControlsIds(
												(prev) => new Set([...prev, video.id]),
											);

											const positions = new Map<
												string,
												{ x: number; y: number }
											>();
											currentSelectedIds.forEach((id) => {
												const vid = videos.find((v) => v.id === id);
												if (vid) {
													positions.set(id, { x: vid.x, y: vid.y });
												}
											});
											setDragStartPositions(positions);
										}}
										onDragEnd={() => {
											setIsDraggingImage(false);
											setHiddenVideoControlsIds((prev) => {
												const newSet = new Set(prev);
												newSet.delete(video.id);
												return newSet;
											});
											saveToHistory();
											setDragStartPositions(new Map());
										}}
										selectedIds={selectedIds}
										videos={videos}
										setVideos={setVideos}
										isDraggingVideo={isDraggingImage}
										isCroppingVideo={false}
										dragStartPositions={dragStartPositions}
										onResizeStart={() =>
											setHiddenVideoControlsIds(
												(prev) => new Set([...prev, video.id]),
											)
										}
										onResizeEnd={() =>
											setHiddenVideoControlsIds((prev) => {
												const newSet = new Set(prev);
												newSet.delete(video.id);
												return newSet;
											})
										}
									/>
								))}

							{/* New Elements (Text, Shape, Drawing) */}
							{elements.map((el) => {
								const isSelected = selectedIds.includes(el.id);
								const updateHandler = (newAttrs: Partial<any>) => {
									setElements((prev) =>
										prev.map((item) =>
											item.id === el.id ? { ...item, ...newAttrs } : item,
										),
									);
								};

								if (el.type === "text") {
									return (
										<CanvasText
											key={el.id}
											element={el as TextElement}
											isSelected={isSelected}
											onSelect={() =>
												handleSelect(el.id, {
													evt: {
														shiftKey: false,
														metaKey: false,
														ctrlKey: false,
													},
												} as any)
											}
											onChange={updateHandler}
											isDraggable={activeTool === "select"}
											autoFocus={justCreatedId === el.id}
										/>
									);
								}
								if (el.type === "shape") {
									return (
										<CanvasShape
											key={el.id}
											element={el as ShapeElement}
											isSelected={isSelected}
											onSelect={() =>
												handleSelect(el.id, {
													evt: {
														shiftKey: false,
														metaKey: false,
														ctrlKey: false,
													},
												} as any)
											}
											onChange={updateHandler}
											isDraggable={activeTool === "select"}
										/>
									);
								}
								if (el.type === "drawing") {
									return (
										<CanvasDrawing
											key={el.id}
											element={el as DrawingElement}
											isSelected={isSelected}
											onSelect={() =>
												handleSelect(el.id, {
													evt: {
														shiftKey: false,
														metaKey: false,
														ctrlKey: false,
													},
												} as any)
											}
											onChange={updateHandler}
											isDraggable={activeTool === "select"}
										/>
									);
								}
								return null;
							})}

							{/* Crop overlay */}
							{croppingImageId &&
								(() => {
									const croppingImage = images.find(
										(img) => img.id === croppingImageId,
									);
									if (!croppingImage) return null;

									return (
										<CropOverlayWrapper
											image={croppingImage}
											viewportScale={viewport.scale}
											onCropChange={(crop) => {
												setImages((prev) =>
													prev.map((img) =>
														img.id === croppingImageId
															? { ...img, ...crop }
															: img,
													),
												);
											}}
											onCropEnd={async () => {
												if (croppingImage) {
													const cropWidth = croppingImage.cropWidth || 1;
													const cropHeight = croppingImage.cropHeight || 1;
													const cropX = croppingImage.cropX || 0;
													const cropY = croppingImage.cropY || 0;

													try {
														const croppedImageSrc = await createCroppedImage(
															croppingImage.src,
															cropX,
															cropY,
															cropWidth,
															cropHeight,
														);

														setImages((prev) =>
															prev.map((img) =>
																img.id === croppingImageId
																	? {
																			...img,
																			src: croppedImageSrc,
																			x: img.x + cropX * img.width,
																			y: img.y + cropY * img.height,
																			width: cropWidth * img.width,
																			height: cropHeight * img.height,
																			cropX: undefined,
																			cropY: undefined,
																			cropWidth: undefined,
																			cropHeight: undefined,
																		}
																	: img,
															),
														);
													} catch (error) {
														console.error(
															"Failed to create cropped image:",
															error,
														);
													}
												}

												setCroppingImageId(null);
												saveToHistory();
											}}
										/>
									);
								})()}
						</Layer>
					</Stage>
				)}
			</div>
		);
	},
);

CanvasStage.displayName = "CanvasStage";
