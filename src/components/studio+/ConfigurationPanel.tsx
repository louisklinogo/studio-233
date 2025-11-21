"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    Code,
    Upload,
    User,
    Palette,
    ImageIcon,
    Wand2,
    X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type WorkflowType = "mannequin" | "style" | "logo" | "custom";

interface Workflow {
    id: WorkflowType;
    title: string;
    description: string;
    icon: React.ElementType;
    needsReference: boolean;
}

const WORKFLOWS: Workflow[] = [
    {
        id: "mannequin",
        title: "Mannequin Transfer",
        description: "Extract clothing and place on reference mannequin",
        icon: User,
        needsReference: true,
    },
    {
        id: "style",
        title: "Style Transfer",
        description: "Apply style from reference to target images",
        icon: Palette,
        needsReference: true,
    },
    {
        id: "logo",
        title: "Logo Overlay",
        description: "Add logo from reference to batch images",
        icon: ImageIcon,
        needsReference: true,
    },
    {
        id: "custom",
        title: "Custom Prompt",
        description: "Define your own transformation",
        icon: Wand2,
        needsReference: false,
    },
];

interface ConfigurationPanelProps {
    filesCount: number;
    workflowType: WorkflowType;
    onWorkflowChange: (workflow: WorkflowType) => void;
    referenceImage: File | null;
    onReferenceChange: (file: File | null) => void;
    customPrompt: string;
    onPromptChange: (prompt: string) => void;
    onStartBatch: () => void;
    onBack?: () => void;
}

export function ConfigurationPanel({
    filesCount,
    workflowType,
    onWorkflowChange,
    referenceImage,
    onReferenceChange,
    customPrompt,
    onPromptChange,
    onStartBatch,
    onBack,
}: ConfigurationPanelProps) {
    const [isDragging, setIsDragging] = useState(false);

    const selectedWorkflow = WORKFLOWS.find((w) => w.id === workflowType)!;
    const needsReference = selectedWorkflow.needsReference;
    const canStart =
        filesCount > 0 && (!needsReference || referenceImage !== null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("image/")) {
                onReferenceChange(file);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onReferenceChange(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="p-4 border-b bg-muted/5">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="font-semibold text-sm tracking-wide text-muted-foreground">
                        Batch Configuration
                    </h2>
                    {filesCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                            {filesCount} files selected
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    Configure transformation settings for your batch.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Workflow Type Selector - Compact Tabs */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Workflow Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {WORKFLOWS.map((workflow) => (
                            <button
                                key={workflow.id}
                                onClick={() => onWorkflowChange(workflow.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                                    workflowType === workflow.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                        : "border-border hover:border-primary/50 hover:bg-accent/50",
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-2 rounded-md",
                                        workflowType === workflow.id
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground",
                                    )}
                                >
                                    <workflow.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{workflow.title}</div>
                                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                                        {workflow.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reference Image - Compact Row */}
                <AnimatePresence mode="wait">
                    {needsReference && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">
                                    Reference Image <span className="text-red-500">*</span>
                                </label>
                                {referenceImage && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-destructive hover:text-destructive"
                                        onClick={() => onReferenceChange(null)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>

                            {!referenceImage ? (
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                                        isDragging
                                            ? "border-primary bg-primary/5"
                                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
                                    )}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onClick={() =>
                                        document.getElementById("reference-upload")?.click()
                                    }
                                >
                                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                        Drop reference image or click to upload
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                                    <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                                        <img
                                            src={URL.createObjectURL(referenceImage)}
                                            alt="Reference"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {referenceImage.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {(referenceImage.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            document.getElementById("reference-upload")?.click()
                                        }
                                    >
                                        <Upload className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                            <input
                                id="reference-upload"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Advanced Prompt - Standard Field */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Code className="w-3 h-3" />
                            Advanced Prompt
                        </label>
                        <Badge variant="outline" className="text-[10px] font-normal">
                            Optional
                        </Badge>
                    </div>
                    <Textarea
                        value={customPrompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        className="font-mono text-xs min-h-[120px] resize-none bg-muted/30"
                        placeholder="Enter custom prompt overrides..."
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-muted/5 flex gap-3">
                {onBack && (
                    <Button variant="outline" onClick={onBack}>
                        Back
                    </Button>
                )}
                <Button
                    onClick={onStartBatch}
                    disabled={!canStart}
                    className="flex-1"
                >
                    Start Batch Processing
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
