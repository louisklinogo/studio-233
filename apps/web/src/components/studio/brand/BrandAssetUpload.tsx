"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { useToast } from "@/hooks/use-toast";
import { useFalClient } from "@/hooks/useFalClient";
import { useUIState } from "@/hooks/useUIState";
import { uploadImageDirect } from "@/lib/handlers/generation-handler";
import { useTRPC } from "@/trpc/client";

interface BrandAssetUploadProps {
	workspaceId: string;
	onSuccess?: () => void;
}

export function BrandAssetUpload({
	workspaceId,
	onSuccess,
}: BrandAssetUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const { toast } = useToast();
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
				toast({
					title: "Asset registered",
					description: "Brand asset added to archive",
				});
			},
		}),
	);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			// Read file as data URL for the direct upload helper
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
				toast,
				setIsApiKeyDialogOpen,
			);

			// 2. Register in DB as Brand Asset
			await registerAsset.mutateAsync({
				name: file.name,
				url: uploadResult.url,
				size: file.size,
				mimeType: file.type,
				workspaceId,
				isBrandAsset: true,
			});
		} catch (error) {
			console.error("Failed to upload brand asset:", error);
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*,application/pdf"
				onChange={handleFileChange}
			/>

			<button
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading || registerAsset.isPending}
				className="w-full py-2 border border-dashed border-neutral-300 dark:border-neutral-700 font-mono text-[10px] uppercase text-neutral-400 hover:text-[#FF4D00] hover:border-[#FF4D00] transition-all flex items-center justify-center gap-2"
			>
				{isUploading ? (
					<>
						<SwissIcons.Spinner size={12} className="animate-spin" />
						Uploading...
					</>
				) : (
					<>+ Add_Asset</>
				)}
			</button>
		</>
	);
}
