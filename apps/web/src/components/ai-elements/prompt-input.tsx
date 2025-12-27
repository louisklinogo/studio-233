"use client";

import { upload } from "@vercel/blob/client";
import type { ChatStatus, FileUIPart } from "ai";
import {
	CornerDownLeftIcon,
	ImageIcon,
	Loader2Icon,
	MicIcon,
	PaperclipIcon,
	PlusIcon,
	SquareIcon,
	XIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import {
	type ChangeEvent,
	type ChangeEventHandler,
	Children,
	type ClipboardEventHandler,
	type ComponentProps,
	createContext,
	type FormEvent,
	type FormEventHandler,
	Fragment,
	type HTMLAttributes,
	type KeyboardEventHandler,
	type PropsWithChildren,
	type ReactNode,
	type RefObject,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Real upload logic using Vercel Blob client SDK
async function uploadFile(file: File): Promise<{ url: string }> {
	const blob = await upload(file.name, file, {
		access: "public",
		handleUploadUrl: "/api/upload",
	});

	return { url: blob.url };
}

export const useUploader = ({
	onUpload,
	onError,
}: {
	onUpload: (props: { id: string; url: string }) => void;
	onError?: (props: { id: string; error: any }) => void;
}) => {
	const [isUploading, setIsUploading] = useState(false);
	const upload = useCallback(
		async (file: FileUIPart & { id: string }) => {
			setIsUploading(true);
			try {
				const blob = await fetch(file.url).then((res) => res.blob());
				const uploaded = await uploadFile(
					new File([blob], file.filename ?? "untitled", {
						type: file.mediaType,
					}),
				);
				onUpload({ id: file.id, url: uploaded.url });
			} catch (e) {
				console.error("Upload failed", e);
				onError?.({ id: file.id, error: e });
			} finally {
				setIsUploading(false);
			}
		},
		[onUpload, onError],
	);
	return { upload, isUploading };
};

// ============================================================================
// Provider Context & Types
// ============================================================================

export type AttachmentsContext = {
	files: (FileUIPart & { id: string; isUploading?: boolean })[];
	add: (files: File[] | FileList) => void;
	addRemote: (
		files: { url: string; filename: string; mediaType: string }[],
	) => void;
	remove: (id: string) => void;
	clear: () => void;
	openFileDialog: () => void;
	fileInputRef: RefObject<HTMLInputElement | null>;
	setFileUploading: (id: string, isUploading: boolean) => void;
	updateFileUrl: (id: string, url: string) => void;
};

export type TextInputContext = {
	value: string;
	setInput: (v: string) => void;
	clear: () => void;
};

export type PromptInputControllerProps = {
	textInput: TextInputContext;
	attachments: AttachmentsContext;
	/** INTERNAL: Allows PromptInput to register its file textInput + "open" callback */
	__registerFileInput: (
		ref: RefObject<HTMLInputElement | null>,
		open: () => void,
	) => void;
};

const PromptInputController = createContext<PromptInputControllerProps | null>(
	null,
);
const ProviderAttachmentsContext = createContext<AttachmentsContext | null>(
	null,
);

export const usePromptInputController = () => {
	const ctx = useContext(PromptInputController);
	if (!ctx) {
		throw new Error(
			"Wrap your component inside <PromptInputProvider> to use usePromptInputController().",
		);
	}
	return ctx;
};

// Optional variants (do NOT throw). Useful for dual-mode components.
const useOptionalPromptInputController = () =>
	useContext(PromptInputController);

export const useProviderAttachments = () => {
	const ctx = useContext(ProviderAttachmentsContext);
	if (!ctx) {
		throw new Error(
			"Wrap your component inside <PromptInputProvider> to use useProviderAttachments().",
		);
	}
	return ctx;
};

const useOptionalProviderAttachments = () =>
	useContext(ProviderAttachmentsContext);

export type PromptInputProviderProps = PropsWithChildren<{
	initialInput?: string;
}>;

/**
 * Optional global provider that lifts PromptInput state outside of PromptInput.
 * If you don't use it, PromptInput stays fully self-managed.
 */
export function PromptInputProvider({
	initialInput: initialTextInput = "",
	children,
}: PromptInputProviderProps) {
	// ----- textInput state
	const [textInput, setTextInput] = useState(initialTextInput);
	const clearInput = useCallback(() => setTextInput(""), []);

	// ----- attachments state (global when wrapped)
	const [attachements, setAttachements] = useState<
		(FileUIPart & { id: string; isUploading?: boolean })[]
	>([]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const openRef = useRef<() => void>(() => {});

	const setFileUploading = useCallback((id: string, isUploading: boolean) => {
		setAttachements((prev) =>
			prev.map((f) => (f.id === id ? { ...f, isUploading } : f)),
		);
	}, []);

	const updateFileUrl = useCallback((id: string, url: string) => {
		setAttachements((prev) =>
			prev.map((f) => (f.id === id ? { ...f, url, isUploading: false } : f)),
		);
	}, []);

	const uploader = useUploader({
		onUpload: ({ id, url }) => {
			updateFileUrl(id, url);
		},
		onError: ({ id }) => {
			setFileUploading(id, false);
		},
	});
	const add = useCallback(
		(files: File[] | FileList) => {
			const incoming = Array.from(files);
			if (incoming.length === 0) {
				return;
			}
			const newAttachments = incoming.map((file) => ({
				id: nanoid(),
				type: "file" as const,
				url: URL.createObjectURL(file),
				mediaType: file.type,
				filename: file.name,
				isUploading: true, // Mark for upload
			}));

			setAttachements((prev) => prev.concat(newAttachments));

			// Trigger uploads
			for (const attachment of newAttachments) {
				uploader.upload(attachment);
			}
		},
		[uploader],
	);

	const addRemote = useCallback(
		(files: { url: string; filename: string; mediaType: string }[]) => {
			if (files.length === 0) return;

			setAttachements((prev) =>
				prev.concat(
					files.map((file) => ({
						id: nanoid(),
						type: "file" as const,
						...file,
					})),
				),
			);
		},
		[],
	);

	const remove = useCallback((id: string) => {
		setAttachements((prev) => {
			const found = prev.find((f) => f.id === id);
			if (found?.url) {
				URL.revokeObjectURL(found.url);
			}
			return prev.filter((f) => f.id !== id);
		});
	}, []);

	const clear = useCallback(() => {
		setAttachements((prev) => {
			for (const f of prev) {
				if (f.url) {
					URL.revokeObjectURL(f.url);
				}
			}
			return [];
		});
	}, []);

	const openFileDialog = useCallback(() => {
		openRef.current?.();
	}, []);

	const attachments = useMemo<AttachmentsContext>(
		() => ({
			files: attachements,
			add,
			addRemote,
			remove,
			clear,
			openFileDialog,
			fileInputRef,
			setFileUploading,
			updateFileUrl,
		}),
		[
			attachements,
			add,
			addRemote,
			remove,
			clear,
			openFileDialog,
			setFileUploading,
			updateFileUrl,
		],
	);

	const __registerFileInput = useCallback(
		(ref: RefObject<HTMLInputElement | null>, open: () => void) => {
			fileInputRef.current = ref.current;
			openRef.current = open;
		},
		[],
	);

	const controller = useMemo<PromptInputControllerProps>(
		() => ({
			textInput: {
				value: textInput,
				setInput: setTextInput,
				clear: clearInput,
			},
			attachments,
			__registerFileInput,
		}),
		[textInput, clearInput, attachments, __registerFileInput],
	);

	return (
		<PromptInputController.Provider value={controller}>
			<ProviderAttachmentsContext.Provider value={attachments}>
				{children}
			</ProviderAttachmentsContext.Provider>
		</PromptInputController.Provider>
	);
}

// ============================================================================
// Component Context & Hooks
// ============================================================================

const LocalAttachmentsContext = createContext<AttachmentsContext | null>(null);

export const usePromptInputAttachments = () => {
	// Dual-mode: prefer provider if present, otherwise use local
	const provider = useOptionalProviderAttachments();
	const local = useContext(LocalAttachmentsContext);
	const context = provider ?? local;
	if (!context) {
		throw new Error(
			"usePromptInputAttachments must be used within a PromptInput or PromptInputProvider",
		);
	}
	return context;
};

export type PromptInputAttachmentProps = HTMLAttributes<HTMLDivElement> & {
	data: FileUIPart & { id: string };
	className?: string;
};

export function PromptInputAttachment({
	data,
	className,
	...props
}: PromptInputAttachmentProps) {
	const attachments = usePromptInputAttachments();
	const filename = data.filename || "";
	const isImage = data.mediaType?.startsWith("image/");
	const thumb = isImage ? data.url : undefined;
	const label = isImage ? "Image" : "Attachment";

	return (
		<HoverCard openDelay={200}>
			<HoverCardTrigger asChild>
				<div
					className={cn(
						"flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] bg-[#f5f3ef] dark:bg-[#101010] border border-neutral-300/80 dark:border-neutral-800 text-[11px] font-mono select-none group hover:border-[#FF4D00] dark:hover:border-[#FF4D00] transition-colors cursor-default shadow-sm",
						className,
					)}
					key={data.id}
					{...props}
				>
					<div className="flex items-center gap-1.5 overflow-hidden max-w-[160px]">
						{thumb ? (
							<div className="size-7 rounded-[6px] overflow-hidden border border-neutral-300/80 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
								<img
									alt={filename}
									src={thumb}
									className="h-full w-full object-cover"
								/>
							</div>
						) : (
							<PaperclipIcon className="size-4 text-neutral-500 shrink-0" />
						)}
						<span className="truncate text-neutral-800 dark:text-neutral-200">
							{label}
						</span>
					</div>

					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							attachments.remove(data.id);
						}}
						className="text-neutral-400 hover:text-[#FF4D00] transition-colors"
					>
						<XIcon className="size-3" />
						<span className="sr-only">Remove</span>
					</button>
				</div>
			</HoverCardTrigger>
			{isImage && (
				<HoverCardContent
					side="top"
					align="start"
					sideOffset={8}
					className="w-48 p-1 bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-xl"
				>
					<div className="relative aspect-square w-full overflow-hidden rounded-[1px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
						<img
							alt={filename}
							src={data.url}
							className="object-cover w-full h-full"
						/>
					</div>
					<div className="px-1 py-1.5">
						<p className="text-[10px] font-mono text-neutral-500 truncate">
							{filename}
						</p>
					</div>
				</HoverCardContent>
			)}
		</HoverCard>
	);
}

export type PromptInputAttachmentsProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	"children"
> & {
	children: (attachment: FileUIPart & { id: string }) => ReactNode;
};

export function PromptInputAttachments({
	children,
	className,
	...props
}: PromptInputAttachmentsProps) {
	const attachments = usePromptInputAttachments();

	if (!attachments.files.length) {
		return null;
	}

	return (
		<div
			className={cn("flex flex-wrap items-center gap-2 p-3", className)}
			{...props}
		>
			{attachments.files.map((file) => (
				<Fragment key={file.id}>{children(file)}</Fragment>
			))}
		</div>
	);
}

export type PromptInputActionAddAttachmentsProps = ComponentProps<
	typeof DropdownMenuItem
> & {
	label?: string;
};

export const PromptInputActionAddAttachments = ({
	label = "Add photos or files",
	...props
}: PromptInputActionAddAttachmentsProps) => {
	const attachments = usePromptInputAttachments();

	return (
		<DropdownMenuItem
			{...props}
			onSelect={(e) => {
				e.preventDefault();
				attachments.openFileDialog();
			}}
		>
			<ImageIcon className="mr-2 size-4" /> {label}
		</DropdownMenuItem>
	);
};

export type PromptInputMessage = {
	text: string;
	files: FileUIPart[];
};

export type PromptInputProps = Omit<
	HTMLAttributes<HTMLFormElement>,
	"onSubmit" | "onError"
> & {
	accept?: string; // e.g., "image/*" or leave undefined for any
	multiple?: boolean;
	// When true, accepts drops anywhere on document. Default false (opt-in).
	globalDrop?: boolean;
	// Render a hidden input with given name and keep it in sync for native form posts. Default false.
	syncHiddenInput?: boolean;
	// Minimal constraints
	maxFiles?: number;
	maxFileSize?: number; // bytes
	onError?: (err: {
		code: "max_files" | "max_file_size" | "accept";
		message: string;
	}) => void;
	onSubmit: (
		message: PromptInputMessage,
		event: FormEvent<HTMLFormElement>,
	) => void | Promise<void>;
};

export const PromptInput = ({
	className,
	accept,
	multiple,
	globalDrop,
	syncHiddenInput,
	maxFiles,
	maxFileSize,
	onError,
	onSubmit,
	children,
	...props
}: PromptInputProps) => {
	// Try to use a provider controller if present
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;

	// Refs
	const inputRef = useRef<HTMLInputElement | null>(null);
	const anchorRef = useRef<HTMLSpanElement>(null);
	const formRef = useRef<HTMLFormElement | null>(null);

	// Find nearest form to scope drag & drop
	useEffect(() => {
		const root = anchorRef.current?.closest("form");
		if (root instanceof HTMLFormElement) {
			formRef.current = root;
		}
	}, []);

	// ----- Local attachments (only used when no provider)
	const [items, setItems] = useState<
		(FileUIPart & { id: string; isUploading?: boolean })[]
	>([]);
	const files = usingProvider ? controller.attachments.files : items;

	const openFileDialogLocal = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const matchesAccept = useCallback(
		(f: File) => {
			if (!accept || accept.trim() === "") {
				return true;
			}
			if (accept.includes("image/*")) {
				return f.type.startsWith("image/");
			}
			// NOTE: keep simple; expand as needed
			return true;
		},
		[accept],
	);

	const uploader = useUploader({
		onUpload: ({ id, url }) => {
			updateFileUrl(id, url);
		},
		onError: ({ id }) => {
			setFileUploading(id, false);
		},
	});

	const addLocal = useCallback(
		(fileList: File[] | FileList) => {
			const incoming = Array.from(fileList);
			const accepted = incoming.filter((f) => matchesAccept(f));
			if (incoming.length && accepted.length === 0) {
				onError?.({
					code: "accept",
					message: "No files match the accepted types.",
				});
				return;
			}
			const withinSize = (f: File) =>
				maxFileSize ? f.size <= maxFileSize : true;
			const sized = accepted.filter(withinSize);
			if (accepted.length > 0 && sized.length === 0) {
				onError?.({
					code: "max_file_size",
					message: "All files exceed the maximum size.",
				});
				return;
			}

			const capacity =
				typeof maxFiles === "number"
					? Math.max(0, maxFiles - items.length)
					: undefined;
			const capped =
				typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) {
				onError?.({
					code: "max_files",
					message: "Too many files. Some were not added.",
				});
			}

			const next: (FileUIPart & { id: string; isUploading: boolean })[] = [];
			for (const file of capped) {
				next.push({
					id: nanoid(),
					type: "file",
					url: URL.createObjectURL(file),
					mediaType: file.type,
					filename: file.name,
					isUploading: true,
				});
			}

			setItems((prev) => prev.concat(next));

			// Trigger uploads
			for (const item of next) {
				uploader.upload(item);
			}
		},
		[matchesAccept, maxFiles, maxFileSize, onError, uploader, items.length],
	);

	const addRemoteLocal = useCallback(
		(files: { url: string; filename: string; mediaType: string }[]) => {
			if (files.length === 0) return;

			const capacity =
				typeof maxFiles === "number"
					? Math.max(0, maxFiles - items.length)
					: undefined;
			const capped =
				typeof capacity === "number" ? files.slice(0, capacity) : files;

			if (typeof capacity === "number" && files.length > capacity) {
				onError?.({
					code: "max_files",
					message: "Too many files. Some were not added.",
				});
			}

			const next = capped.map((file) => ({
				id: nanoid(),
				type: "file" as const,
				...file,
				isUploading: true,
			}));

			setItems((prev) => prev.concat(next));

			// Trigger uploads
			for (const item of next) {
				uploader.upload(item);
			}
		},
		[maxFiles, onError, uploader, items.length],
	);

	const add = usingProvider
		? (files: File[] | FileList) => controller.attachments.add(files)
		: addLocal;

	const addRemote = usingProvider
		? (files: any[]) => controller.attachments.addRemote(files)
		: addRemoteLocal;

	const remove = usingProvider
		? (id: string) => controller.attachments.remove(id)
		: (id: string) =>
				setItems((prev) => {
					const found = prev.find((file) => file.id === id);
					if (found?.url) {
						URL.revokeObjectURL(found.url);
					}
					return prev.filter((file) => file.id !== id);
				});

	const clear = usingProvider
		? () => controller.attachments.clear()
		: () =>
				setItems((prev) => {
					for (const file of prev) {
						if (file.url) {
							URL.revokeObjectURL(file.url);
						}
					}
					return [];
				});

	const openFileDialog = usingProvider
		? () => controller.attachments.openFileDialog()
		: openFileDialogLocal;

	// Let provider know about our hidden file input so external menus can call openFileDialog()
	useEffect(() => {
		if (!usingProvider) return;
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);

	// Note: File input cannot be programmatically set for security reasons
	// The syncHiddenInput prop is no longer functional
	useEffect(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) {
			inputRef.current.value = "";
		}
	}, [files, syncHiddenInput]);

	// Attach drop handlers on nearest form and document (opt-in)
	useEffect(() => {
		const form = formRef.current;
		if (!form) return;

		const onDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
		};
		const onDrop = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				add(e.dataTransfer.files);
			}
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add]);

	useEffect(() => {
		if (!globalDrop) return;

		const onDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
		};
		const onDrop = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				add(e.dataTransfer.files);
			}
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);

	useEffect(
		() => () => {
			if (!usingProvider) {
				for (const f of files) {
					if (f.url) URL.revokeObjectURL(f.url);
				}
			}
		},
		[usingProvider, files],
	);

	const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		if (event.currentTarget.files) {
			add(event.currentTarget.files);
		}
	};

	const setFileUploading = useCallback((id: string, isUploading: boolean) => {
		setItems((prev) =>
			prev.map((f) => (f.id === id ? { ...f, isUploading } : f)),
		);
	}, []);

	const updateFileUrl = useCallback((id: string, url: string) => {
		setItems((prev) =>
			prev.map((f) => (f.id === id ? { ...f, url, isUploading: false } : f)),
		);
	}, []);

	const ctx = useMemo<AttachmentsContext>(
		() => ({
			files,
			add,
			addRemote,
			remove,
			clear,
			openFileDialog,
			fileInputRef: inputRef,
			setFileUploading,
			updateFileUrl,
		}),
		[
			files,
			add,
			addRemote,
			remove,
			clear,
			openFileDialog,
			setFileUploading,
			updateFileUrl,
		],
	);

	const convertBlobUrlToDataUrl = async (url: string): Promise<string> => {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	};

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();

		const form = event.currentTarget;
		const text = usingProvider
			? controller.textInput.value
			: (() => {
					const formData = new FormData(form);
					return (formData.get("message") as string) || "";
				})();

		// Reset form immediately
		if (!usingProvider) {
			form.reset();
		}

		// Robustly prepare files: use uploaded URL if available, otherwise convert blob to base64
		const prepareFiles = async () => {
			return Promise.all(
				files.map(async ({ id, isUploading, ...item }) => {
					// If it's a blob URL (upload pending/failed/local), convert to base64
					if (item.url && item.url.startsWith("blob:")) {
						try {
							const base64 = await convertBlobUrlToDataUrl(item.url);
							return { ...item, url: base64 };
						} catch (e) {
							console.error("Failed to convert blob to base64", e);
							return item; // Send as is (will likely fail on server but better than crashing here)
						}
					}
					// Otherwise use the remote URL
					return item;
				}),
			);
		};

		prepareFiles().then((preparedFiles) => {
			try {
				const result = onSubmit({ text, files: preparedFiles }, event);

				if (result instanceof Promise) {
					result
						.then(() => {
							clear();
							if (usingProvider) {
								controller.textInput.clear();
							}
						})
						.catch(() => {
							// Don't clear on error
						});
				} else {
					clear();
					if (usingProvider) {
						controller.textInput.clear();
					}
				}
			} catch (error) {
				// Don't clear on error
			}
		});
	};

	// Render with or without local provider
	const inner = (
		<>
			<span aria-hidden="true" className="hidden" ref={anchorRef} />
			<input
				accept={accept}
				aria-label="Upload files"
				className="hidden"
				multiple={multiple}
				onChange={handleChange}
				ref={inputRef}
				title="Upload files"
				type="file"
			/>
			<form
				className={cn("w-full", className)}
				onSubmit={handleSubmit}
				{...props}
			>
				<InputGroup className="overflow-hidden">{children}</InputGroup>
			</form>
		</>
	);

	return usingProvider ? (
		inner
	) : (
		<LocalAttachmentsContext.Provider value={ctx}>
			{inner}
		</LocalAttachmentsContext.Provider>
	);
};

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputBody = ({
	className,
	...props
}: PromptInputBodyProps) => (
	<div className={cn("contents", className)} {...props} />
);

export type PromptInputTextareaProps = ComponentProps<
	typeof InputGroupTextarea
>;

export const PromptInputTextarea = ({
	onChange,
	className,
	placeholder = "What would you like to know?",
	...props
}: PromptInputTextareaProps) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = useState(false);

	const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
		if (e.key === "Enter") {
			if (isComposing || e.nativeEvent.isComposing) {
				return;
			}
			if (e.shiftKey) {
				return;
			}
			e.preventDefault();

			// Check if the submit button is disabled before submitting
			const form = e.currentTarget.form;
			const submitButton = form?.querySelector(
				'button[type="submit"]',
			) as HTMLButtonElement | null;
			if (submitButton?.disabled) {
				return;
			}

			form?.requestSubmit();
		}

		// Remove last attachment when Backspace is pressed and textarea is empty
		if (
			e.key === "Backspace" &&
			e.currentTarget.value === "" &&
			attachments.files.length > 0
		) {
			e.preventDefault();
			const lastAttachment = attachments.files.at(-1);
			if (lastAttachment) {
				attachments.remove(lastAttachment.id);
			}
		}
	};

	const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
		const items = event.clipboardData?.items;

		if (!items) {
			return;
		}

		const files: File[] = [];

		for (const item of items) {
			if (item.kind === "file") {
				const file = item.getAsFile();
				if (file) {
					files.push(file);
				}
			}
		}

		if (files.length > 0) {
			event.preventDefault();
			attachments.add(files);
		}
	};

	const controlledProps = controller
		? {
				value: controller.textInput.value,
				onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
					controller.textInput.setInput(e.currentTarget.value);
					onChange?.(e);
				},
			}
		: {
				onChange,
			};

	return (
		<InputGroupTextarea
			className={cn("field-sizing-content max-h-48 min-h-16", className)}
			name="message"
			onCompositionEnd={() => setIsComposing(false)}
			onCompositionStart={() => setIsComposing(true)}
			onKeyDown={handleKeyDown}
			onPaste={handlePaste}
			placeholder={placeholder}
			{...props}
			{...controlledProps}
		/>
	);
};

export type PromptInputHeaderProps = Omit<
	ComponentProps<typeof InputGroupAddon>,
	"align"
>;

export const PromptInputHeader = ({
	className,
	...props
}: PromptInputHeaderProps) => (
	<InputGroupAddon
		align="block-end"
		className={cn("order-first flex-wrap gap-1", className)}
		{...props}
	/>
);

export type PromptInputFooterProps = Omit<
	ComponentProps<typeof InputGroupAddon>,
	"align"
>;

export const PromptInputFooter = ({
	className,
	...props
}: PromptInputFooterProps) => (
	<InputGroupAddon
		align="block-end"
		className={cn("justify-between gap-1", className)}
		{...props}
	/>
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
	className,
	...props
}: PromptInputToolsProps) => (
	<div className={cn("flex items-center gap-1", className)} {...props} />
);

export type PromptInputButtonProps = ComponentProps<typeof InputGroupButton>;

export const PromptInputButton = ({
	variant = "ghost",
	className,
	size,
	...props
}: PromptInputButtonProps) => {
	const newSize =
		size ?? (Children.count(props.children) > 1 ? "sm" : "icon-sm");

	return (
		<InputGroupButton
			className={cn(className)}
			size={newSize}
			type="button"
			variant={variant}
			{...props}
		/>
	);
};

export type PromptInputActionMenuProps = ComponentProps<typeof DropdownMenu>;
export const PromptInputActionMenu = (props: PromptInputActionMenuProps) => (
	<DropdownMenu {...props} />
);

export type PromptInputActionMenuTriggerProps = PromptInputButtonProps;

export const PromptInputActionMenuTrigger = ({
	className,
	children,
	...props
}: PromptInputActionMenuTriggerProps) => (
	<DropdownMenuTrigger asChild>
		<PromptInputButton className={className} {...props}>
			{children ?? <PlusIcon className="size-4" />}
		</PromptInputButton>
	</DropdownMenuTrigger>
);

export type PromptInputActionMenuContentProps = ComponentProps<
	typeof DropdownMenuContent
>;
export const PromptInputActionMenuContent = ({
	className,
	...props
}: PromptInputActionMenuContentProps) => (
	<DropdownMenuContent align="start" className={cn(className)} {...props} />
);

export type PromptInputActionMenuItemProps = ComponentProps<
	typeof DropdownMenuItem
>;
export const PromptInputActionMenuItem = ({
	className,
	...props
}: PromptInputActionMenuItemProps) => (
	<DropdownMenuItem className={cn(className)} {...props} />
);

// Note: Actions that perform side-effects (like opening a file dialog)
// are provided in opt-in modules (e.g., prompt-input-attachments).

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
	status?: ChatStatus;
};

export const PromptInputSubmit = ({
	className,
	variant = "default",
	size = "icon-sm",
	status,
	children,
	...props
}: PromptInputSubmitProps) => {
	let Icon = <CornerDownLeftIcon className="size-4" />;

	if (status === "submitted") {
		Icon = <Loader2Icon className="size-4 animate-spin" />;
	} else if (status === "streaming") {
		Icon = <SquareIcon className="size-4" />;
	} else if (status === "error") {
		Icon = <XIcon className="size-4" />;
	}

	return (
		<InputGroupButton
			aria-label="Submit"
			className={cn(className)}
			size={size}
			type="submit"
			variant={variant}
			{...props}
		>
			{children ?? Icon}
		</InputGroupButton>
	);
};

interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
	onend: ((this: SpeechRecognition, ev: Event) => any) | null;
	onresult:
		| ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
		| null;
	onerror:
		| ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
		| null;
}

interface SpeechRecognitionEvent extends Event {
	results: SpeechRecognitionResultList;
	resultIndex: number;
}

type SpeechRecognitionResultList = {
	readonly length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
	readonly length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
	isFinal: boolean;
};

type SpeechRecognitionAlternative = {
	transcript: string;
	confidence: number;
};

interface SpeechRecognitionErrorEvent extends Event {
	error: string;
}

declare global {
	interface Window {
		SpeechRecognition: {
			new (): SpeechRecognition;
		};
		webkitSpeechRecognition: {
			new (): SpeechRecognition;
		};
	}
}

export type PromptInputSpeechButtonProps = ComponentProps<
	typeof PromptInputButton
> & {
	textareaRef?: RefObject<HTMLTextAreaElement | null>;
	onTranscriptionChange?: (text: string) => void;
};

export const PromptInputSpeechButton = ({
	className,
	textareaRef,
	onTranscriptionChange,
	...props
}: PromptInputSpeechButtonProps) => {
	const [isListening, setIsListening] = useState(false);
	const [recognition, setRecognition] = useState<SpeechRecognition | null>(
		null,
	);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
		) {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			const speechRecognition = new SpeechRecognition();

			speechRecognition.continuous = true;
			speechRecognition.interimResults = true;
			speechRecognition.lang = "en-US";

			speechRecognition.onstart = () => {
				setIsListening(true);
			};

			speechRecognition.onend = () => {
				setIsListening(false);
			};

			speechRecognition.onresult = (event) => {
				let finalTranscript = "";

				for (let i = event.resultIndex; i < event.results.length; i++) {
					const result = event.results[i];
					if (result.isFinal) {
						finalTranscript += result[0]?.transcript ?? "";
					}
				}

				if (finalTranscript && textareaRef?.current) {
					const textarea = textareaRef.current;
					const currentValue = textarea.value;
					const newValue =
						currentValue + (currentValue ? " " : "") + finalTranscript;

					textarea.value = newValue;
					textarea.dispatchEvent(new Event("input", { bubbles: true }));
					onTranscriptionChange?.(newValue);
				}
			};

			speechRecognition.onerror = (event) => {
				console.error("Speech recognition error:", event.error);
				setIsListening(false);
			};

			recognitionRef.current = speechRecognition;
			setRecognition(speechRecognition);
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, [textareaRef, onTranscriptionChange]);

	const toggleListening = useCallback(() => {
		if (!recognition) {
			return;
		}

		if (isListening) {
			recognition.stop();
		} else {
			recognition.start();
		}
	}, [recognition, isListening]);

	return (
		<PromptInputButton
			className={cn(
				"relative transition-all duration-200",
				isListening && "animate-pulse bg-accent text-accent-foreground",
				className,
			)}
			disabled={!recognition}
			onClick={toggleListening}
			{...props}
		>
			<MicIcon className="size-4" />
		</PromptInputButton>
	);
};

export type PromptInputSelectProps = ComponentProps<typeof Select>;

export const PromptInputSelect = (props: PromptInputSelectProps) => (
	<Select {...props} />
);

export type PromptInputSelectTriggerProps = ComponentProps<
	typeof SelectTrigger
>;

export const PromptInputSelectTrigger = ({
	className,
	...props
}: PromptInputSelectTriggerProps) => (
	<SelectTrigger
		className={cn(
			"border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors",
			"hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground",
			className,
		)}
		{...props}
	/>
);

export type PromptInputSelectContentProps = ComponentProps<
	typeof SelectContent
>;

export const PromptInputSelectContent = ({
	className,
	...props
}: PromptInputSelectContentProps) => (
	<SelectContent className={cn(className)} {...props} />
);

export type PromptInputSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputSelectItem = ({
	className,
	...props
}: PromptInputSelectItemProps) => (
	<SelectItem className={cn(className)} {...props} />
);

export type PromptInputSelectValueProps = ComponentProps<typeof SelectValue>;

export const PromptInputSelectValue = ({
	className,
	...props
}: PromptInputSelectValueProps) => (
	<SelectValue className={cn(className)} {...props} />
);

export type PromptInputHoverCardProps = ComponentProps<typeof HoverCard>;

export const PromptInputHoverCard = ({
	openDelay = 0,
	closeDelay = 0,
	...props
}: PromptInputHoverCardProps) => (
	<HoverCard closeDelay={closeDelay} openDelay={openDelay} {...props} />
);

export type PromptInputHoverCardTriggerProps = ComponentProps<
	typeof HoverCardTrigger
>;

export const PromptInputHoverCardTrigger = (
	props: PromptInputHoverCardTriggerProps,
) => <HoverCardTrigger {...props} />;

export type PromptInputHoverCardContentProps = ComponentProps<
	typeof HoverCardContent
>;

export const PromptInputHoverCardContent = ({
	align = "start",
	...props
}: PromptInputHoverCardContentProps) => (
	<HoverCardContent align={align} {...props} />
);

export type PromptInputTabsListProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabsList = ({
	className,
	...props
}: PromptInputTabsListProps) => <div className={cn(className)} {...props} />;

export type PromptInputTabProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTab = ({
	className,
	...props
}: PromptInputTabProps) => <div className={cn(className)} {...props} />;

export type PromptInputTabLabelProps = HTMLAttributes<HTMLHeadingElement>;

export const PromptInputTabLabel = ({
	className,
	...props
}: PromptInputTabLabelProps) => (
	<h3
		className={cn(
			"mb-2 px-3 font-medium text-muted-foreground text-xs",
			className,
		)}
		{...props}
	/>
);

export type PromptInputTabBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabBody = ({
	className,
	...props
}: PromptInputTabBodyProps) => (
	<div className={cn("space-y-1", className)} {...props} />
);

export type PromptInputTabItemProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTabItem = ({
	className,
	...props
}: PromptInputTabItemProps) => (
	<div
		className={cn(
			"flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent",
			className,
		)}
		{...props}
	/>
);

export type PromptInputCommandProps = ComponentProps<typeof Command>;

export const PromptInputCommand = ({
	className,
	...props
}: PromptInputCommandProps) => <Command className={cn(className)} {...props} />;

export type PromptInputCommandInputProps = ComponentProps<typeof CommandInput>;

export const PromptInputCommandInput = ({
	className,
	...props
}: PromptInputCommandInputProps) => (
	<CommandInput className={cn(className)} {...props} />
);

export type PromptInputCommandListProps = ComponentProps<typeof CommandList>;

export const PromptInputCommandList = ({
	className,
	...props
}: PromptInputCommandListProps) => (
	<CommandList className={cn(className)} {...props} />
);

export type PromptInputCommandEmptyProps = ComponentProps<typeof CommandEmpty>;

export const PromptInputCommandEmpty = ({
	className,
	...props
}: PromptInputCommandEmptyProps) => (
	<CommandEmpty className={cn(className)} {...props} />
);

export type PromptInputCommandGroupProps = ComponentProps<typeof CommandGroup>;

export const PromptInputCommandGroup = ({
	className,
	...props
}: PromptInputCommandGroupProps) => (
	<CommandGroup className={cn(className)} {...props} />
);

export type PromptInputCommandItemProps = ComponentProps<typeof CommandItem>;

export const PromptInputCommandItem = ({
	className,
	...props
}: PromptInputCommandItemProps) => (
	<CommandItem className={cn(className)} {...props} />
);

export type PromptInputCommandSeparatorProps = ComponentProps<
	typeof CommandSeparator
>;

export const PromptInputCommandSeparator = ({
	className,
	...props
}: PromptInputCommandSeparatorProps) => (
	<CommandSeparator className={cn(className)} {...props} />
);
