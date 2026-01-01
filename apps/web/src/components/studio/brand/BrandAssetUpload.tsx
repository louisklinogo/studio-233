"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upload } from "@vercel/blob/client";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface BrandAssetUploadProps {
	workspaceId: string;
	onSuccess?: () => void;
	onStatusChange?: (message: string | null) => void;
}

export function BrandAssetUpload({
	workspaceId,
	onSuccess,
	onStatusChange,
}: BrandAssetUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isInspiration, setIsInspiration] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const registerAsset = useMutation(
		trpc.asset.register.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(
					trpc.workspace.getBrandAssets.queryFilter({ workspaceId }),
				);
				onSuccess?.();
			},
		}),
	);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		setIsUploading(true);
		setUploadProgress(0);
		onStatusChange?.("INITIALIZING_UPLOADS...");

		try {
			const classification = isInspiration
				? "INDEX_AS_INSPIRATION"
				: "CORE_BRAND_MARK";

			const fileList = Array.from(files);
			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				onStatusChange?.(
					`UPLOADING: ${file.name.toUpperCase()} [${i + 1}/${fileList.length}]`,
				);

				// 1. Upload to Vercel Blob directly from client
				const blob = await upload(`brand/${workspaceId}/${file.name}`, file, {
					access: "public",
					handleUploadUrl: "/api/upload",
					onUploadProgress: (progress) => {
						const totalProgress = Math.round(
							((i + progress.percentage / 100) / fileList.length) * 100,
						);
						setUploadProgress(totalProgress);
					},
				});

				onStatusChange?.(`REGISTERING: ${file.name.toUpperCase()}`);
				console.log("[BrandAssetUpload] Registering with DB:", {
					name: file.name,
					url: blob.url,
					workspaceId,
					classification,
				});

				// 2. Register in DB as Brand Asset
				await registerAsset.mutateAsync({
					name: file.name,
					url: blob.url,
					size: file.size,
					mimeType: file.type || "application/octet-stream",
					workspaceId,
					isBrandAsset: true,
					classification,
				});
				console.log("[BrandAssetUpload] DB Registration successful");
			}

			onStatusChange?.("ASSET_SYNCHRONIZATION_COMPLETE");

			// Clear status after delay
			setTimeout(() => onStatusChange?.(null), 5000);
		} catch (error: any) {
			// Industrial Error Extraction
			console.error("[BrandAssetUpload] Critical System Fault:", error);
			if (error.stack) console.error("Stack:", error.stack);
			if (error.data) console.error("Error Data:", error.data);
			if (error.cause) console.error("Error Cause:", error.cause);

			let faultMessage = "SYSTEM_SUBSURFACE_ERROR";

			// Handle TRPC specifically
			if (error?.shape?.message) {
				faultMessage = error.shape.message;
			} else if (error?.message) {
				faultMessage = error.message;
			} else if (typeof error === "string") {
				faultMessage = error;
			} else if (error && typeof error === "object") {
				try {
					faultMessage = error.error || JSON.stringify(error);
				} catch {
					faultMessage = "UNSERIALIZABLE_FAULT_DETECTED";
				}
			}

			const formattedFault = String(faultMessage)
				.toUpperCase()
				.replace(/\s+/g, "_")
				.slice(0, 48); // Cap length for header visibility

			onStatusChange?.(`CRITICAL_FAULT: ${formattedFault}`);
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<div className="relative w-full h-full flex flex-col gap-4">
			<div className="flex items-center justify-between px-2">
				<Label
					htmlFor="inspiration-mode"
					className="font-mono text-[8px] uppercase tracking-widest text-neutral-500 cursor-pointer"
				>
					{isInspiration ? "MODE: INSPIRATION" : "MODE: CORE_MARK"}
				</Label>
				<Switch
					id="inspiration-mode"
					checked={isInspiration}
					onCheckedChange={setIsInspiration}
					disabled={isUploading}
					className="data-[state=checked]:bg-[#FF4D00] scale-75"
				/>
			</div>

			<div className="flex-1 relative">
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple
					accept="image/*,application/pdf"
					onChange={handleFileChange}
				/>

				<button
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className={cn(
						"w-full h-full flex flex-col items-center justify-center transition-all relative overflow-hidden rounded-sm group",
						isUploading
							? "bg-neutral-50 dark:bg-black/40 cursor-wait min-h-[120px]"
							: "bg-white dark:bg-black border border-dashed border-neutral-200 dark:border-white/10 hover:border-[#FF4D00] hover:bg-neutral-50 dark:hover:bg-[#FF4D00]/5 min-h-[120px]",
					)}
				>
					{isUploading ? (
						<>
							{/* Upward filling progress background */}
							<motion.div
								initial={{ height: 0 }}
								animate={{ height: `${uploadProgress}%` }}
								className="absolute bottom-0 left-0 right-0 bg-[#FF4D00]/10 pointer-events-none"
							/>
							<SwissIcons.Spinner
								size={20}
								className="animate-spin text-[#FF4D00] relative z-10 mb-2"
							/>
							<span className="font-mono text-[8px] text-[#FF4D00] font-bold relative z-10 uppercase tracking-widest">
								{uploadProgress}%
							</span>
						</>
					) : (
						<>
							<span className="text-3xl font-light text-neutral-300 group-hover:text-[#FF4D00] transition-colors mb-1">
								+
							</span>
							<span className="font-mono text-[7px] text-neutral-400 group-hover:text-[#FF4D00] uppercase tracking-[0.2em] transition-colors">
								{isInspiration ? "Upload_Inspiration" : "Add_Brand_Mark"}
							</span>
						</>
					)}
				</button>
			</div>
		</div>
	);
}
