"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { useFalClient } from "@/hooks/useFalClient";
import { useUIState } from "@/hooks/useUIState";
import { uploadImageDirect } from "@/lib/handlers/generation-handler";
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
	const { customApiKey, setIsApiKeyDialogOpen } = useUIState();
	const falClient = useFalClient(customApiKey);
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
			const fileList = Array.from(files);
			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				const progress = Math.round(((i + 0.1) / fileList.length) * 100);
				setUploadProgress(progress);
				onStatusChange?.(
					`UPLOADING: ${file.name.toUpperCase()} [${i + 1}/${fileList.length}]`,
				);

				// Read file as data URL
				const reader = new FileReader();
				const dataUrl = await new Promise<string>((resolve, reject) => {
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(file);
				});

				// 1. Upload to storage (FAL)
				const uploadResult = await uploadImageDirect(
					dataUrl,
					falClient,
					() => {}, // No toast
					setIsApiKeyDialogOpen,
				);

				onStatusChange?.(`REGISTERING: ${file.name.toUpperCase()}`);

				// 2. Register in DB as Brand Asset
				await registerAsset.mutateAsync({
					name: file.name,
					url: uploadResult.url,
					size: file.size,
					mimeType: file.type,
					workspaceId,
					isBrandAsset: true,
				});
			}

			onStatusChange?.("ALL_ASSETS_RELIQUISHED_SUCCESSFULLY");
		} catch (error) {
			console.error("Failed to upload brand assets:", error);
			onStatusChange?.(
				`UPLOAD_FAILURE: ${error instanceof Error ? error.message.toUpperCase() : "UNKNOWN_ERROR"}`,
			);
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-2">
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
				disabled={isUploading || registerAsset.isPending}
				className="w-full py-2.5 border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-black/50 rounded-[2px] font-mono text-[10px] uppercase text-neutral-400 hover:text-[#FF4D00] hover:border-[#FF4D00] transition-all flex items-center justify-center gap-2 group"
			>
				{isUploading ? (
					<>
						<SwissIcons.Spinner
							size={12}
							className="animate-spin text-[#FF4D00]"
						/>
						<span className="text-[#FF4D00]">Processing_{uploadProgress}%</span>
					</>
				) : (
					<>
						<span className="group-hover:translate-x-[-2px] transition-transform">
							+
						</span>
						Add_Brand_Asset
					</>
				)}
			</button>

			{isUploading && (
				<div className="h-0.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
					<div
						className="h-full bg-[#FF4D00] transition-all duration-300"
						style={{ width: `${uploadProgress}%` }}
					/>
				</div>
			)}
		</div>
	);
}
