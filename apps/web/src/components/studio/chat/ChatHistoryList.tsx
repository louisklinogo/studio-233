"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface ChatHistoryListProps {
	onSelectThread: (threadId: string) => void;
	activeThreadId?: string | null;
	className?: string;
}

export const ChatHistoryList: React.FC<ChatHistoryListProps> = ({
	onSelectThread,
	activeThreadId,
	className,
}) => {
	const trpc = useTRPC();
	const [searchQuery, setSearchQuery] = React.useState("");
	const [activeTab, setActiveTab] = React.useState<
		"threads" | "media" | "apps"
	>("threads");

	const { data, isLoading } = useQuery({
		...trpc.agent.getThreads.queryOptions({ limit: 50 }),
		refetchOnWindowFocus: false,
	});

	const threads = React.useMemo(() => {
		const items = data?.items ?? [];
		if (!searchQuery) return items;
		const query = searchQuery.toLowerCase();
		return items.filter(
			(t) =>
				t.title?.toLowerCase().includes(query) ||
				t.snippet?.toLowerCase().includes(query),
		);
	}, [data?.items, searchQuery]);

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-background text-foreground border-r border-border",
				className,
			)}
		>
			{/* Header Tabs */}
			<div className="flex border-b border-border px-2 bg-muted/30">
				{(["threads", "media", "apps"] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={cn(
							"px-4 py-3 text-[11px] font-medium uppercase tracking-wider transition-all relative",
							activeTab === tab
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{tab}
						{activeTab === tab && (
							<div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#FF4D00]" />
						)}
					</button>
				))}
			</div>

			{/* Search Bar */}
			<div className="p-4 border-b border-border bg-muted/20">
				<div className="relative group">
					<SwissIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-[#FF4D00]" />
					<input
						type="text"
						placeholder="Search your Threads..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-background border border-border rounded-md py-2.5 pl-10 pr-4 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#FF4D00]/30 focus:border-[#FF4D00]/50 transition-all font-mono"
					/>
				</div>
			</div>

			{/* Filters Sub-header */}
			<div className="flex gap-2 px-4 py-3 bg-muted/10 border-b border-border overflow-x-auto scrollbar-none">
				{["Select", "Source", "Type", "Temporary Threads: Show"].map(
					(filter) => (
						<button
							key={filter}
							className="whitespace-nowrap px-3 py-1 rounded-sm border border-border bg-background text-[10px] text-muted-foreground hover:text-foreground hover:border-accent transition-all"
						>
							{filter} <span className="ml-1 text-[8px] opacity-50">▼</span>
						</button>
					),
				)}
				<div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground whitespace-nowrap">
					Sort: Newest <span className="opacity-50">▼</span>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-0 scrollbar-swiss">
				{isLoading ? (
					<div className="flex items-center justify-center p-8">
						<div className="w-4 h-4 rounded-full border-2 border-border border-t-[#FF4D00] animate-spin" />
					</div>
				) : threads.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
						<SwissIcons.History className="w-8 h-8 mb-4 opacity-20" />
						<div className="text-center text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">
							Archive Empty
						</div>
					</div>
				) : (
					<div className="flex flex-col">
						{threads.map((thread) => (
							<button
								key={thread.id}
								onClick={() => onSelectThread(thread.id)}
								className={cn(
									"group flex flex-col gap-1.5 p-5 border-b border-border text-left transition-all duration-200 relative",
									activeThreadId === thread.id
										? "bg-accent/50"
										: "hover:bg-accent/20",
								)}
							>
								{activeThreadId === thread.id && (
									<div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF4D00]" />
								)}

								<div className="flex items-start justify-between">
									<div
										className={cn(
											"text-[13px] font-bold tracking-tight line-clamp-1 flex-1",
											activeThreadId === thread.id
												? "text-foreground"
												: "text-foreground/80 group-hover:text-foreground",
										)}
									>
										{thread.title || "Untitled Conversation"}
									</div>
									<div className="text-muted-foreground group-hover:text-foreground transition-colors ml-2">
										<SwissIcons.Link size={12} className="opacity-40" />
									</div>
								</div>

								{thread.snippet && (
									<div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-mono opacity-80 group-hover:opacity-100 transition-opacity">
										{thread.snippet}
									</div>
								)}

								<div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground/60 font-mono">
									<SwissIcons.Clock size={11} className="opacity-40" />
									<span>
										{formatDistanceToNow(new Date(thread.updatedAt), {
											addSuffix: true,
										})}
									</span>
									<span className="mx-1.5 opacity-20">|</span>
									<span className="opacity-40">
										{thread.id.slice(-6).toUpperCase()}
									</span>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
