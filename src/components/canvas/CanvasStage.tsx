import Konva from "konva";
import React from "react";
import { Layer, Stage } from "react-konva";
import { CanvasGrid } from "@/components/canvas/CanvasGrid";
import { CanvasImage } from "@/components/canvas/CanvasImage";
import { CanvasVideo } from "@/components/canvas/CanvasVideo";
import { CropOverlayWrapper } from "@/components/canvas/CropOverlayWrapper";
import { SelectionBoxComponent } from "@/components/canvas/SelectionBox";
import type { ViewportState } from "@/hooks/useViewportState";
import type { PlacedImage, PlacedVideo, SelectionBox } from "@/types/canvas";
import { createCroppedImage } from "@/utils/image-processing";

interface CanvasStageProps {
	canvasSize: { width: number; height: number };
	viewport: ViewportState;
	isCanvasReady: boolean;
	stageRef: React.RefObject<Konva.Stage | null>;
	images: PlacedImage[];
	videos: PlacedVideo[];
	selectedIds: string[];
	selectionBox: SelectionBox;
	isSelecting: boolean;
	showGrid: boolean;
	isPanningCanvas: boolean;
	croppingImageId: string | null;
	dragStartPositions: Map<string, { x: number; y: number }>;
	isDraggingImage: boolean;

	// State setters
	setImages: React.Dispatch<React.SetStateAction<PlacedImage[]>>;
	setVideos: React.Dispatch<React.SetStateAction<PlacedVideo[]>>;
	setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
	setIsDraggingImage: (isDragging: boolean) => void;
	setHiddenVideoControlsIds: React.Dispatch<React.SetStateAction<Set<string>>>;
	setDragStartPositions: (
		positions: Map<string, { x: number; y: number }>,
	) => void;
	setCroppingImageId: (id: string | null) => void;
	saveToHistory: () => void;

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
	handleSelect: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
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
			selectedIds,
			selectionBox,
			isSelecting,
			showGrid,
			isPanningCanvas,
			croppingImageId,
			dragStartPositions,
			isDraggingImage,
			setImages,
			setVideos,
			setSelectedIds,
			setIsDraggingImage,
			setHiddenVideoControlsIds,
			setDragStartPositions,
			setCroppingImageId,
			saveToHistory,
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
		return (
			<div
				ref={ref}
				className="relative bg-background overflow-hidden w-full h-full"
				style={{
					height: `${canvasSize.height}px`,
					width: `${canvasSize.width}px`,
					minHeight: `${canvasSize.height}px`,
					minWidth: `${canvasSize.width}px`,
					cursor: isPanningCanvas ? "grabbing" : "default",
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
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onMouseLeave={onMouseLeave}
						onWheel={onWheel}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onTouchEnd={onTouchEnd}
						onContextMenu={onContextMenu}
					>
						<Layer>
							{showGrid && (
								<CanvasGrid viewport={viewport} canvasSize={canvasSize} />
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
