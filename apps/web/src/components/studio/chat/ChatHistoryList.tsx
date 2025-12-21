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
	const { data, isLoading } = useQuery({
		...trpc.agent.getThreads.queryOptions({ limit: 50 }),
		refetchOnWindowFocus: false,
	});

	const threads = data?.items ?? [];

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-[#f4f4f0] dark:bg-[#111111]",
				className,
			)}
		>
			<div className="h-8 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#151515]">
				<span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
					Log_Tape // History
				</span>
			</div>

			<div className="flex-1 overflow-y-auto p-0 scrollbar-swiss">
				{isLoading ? (
					<div className="flex items-center justify-center p-8">
						<div className="w-4 h-4 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin" />
					</div>
				) : threads.length === 0 ? (
					<div className="flex flex-col items-center justify-center p-8 text-neutral-400 opacity-50">
						<SwissIcons.History className="w-8 h-8 mb-2" />
						<div className="text-center text-[10px] text-neutral-400 pt-4 font-mono uppercase tracking-wider">
							No Records
						</div>
					</div>
				) : (
					<div className="flex flex-col">
						{threads.map((thread) => (
							<button
								key={thread.id}
								onClick={() => onSelectThread(thread.id)}
								className={cn(
									"flex flex-col gap-1 p-4 border-b border-neutral-200 dark:border-neutral-800 text-left transition-colors font-mono",
									activeThreadId === thread.id
										? "bg-white dark:bg-[#1a1a1a] border-l-2 border-l-[#FF4D00]"
										: "hover:bg-neutral-100 dark:hover:bg-[#151515] border-l-2 border-l-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200",
								)}
							>
								<div className="text-xs font-medium truncate w-full">
									{thread.title || "Untitled Conversation"}
								</div>
								<div className="flex items-center justify-between text-[10px] text-neutral-400">
									<span>{thread.id.slice(-8)}</span>
									<span>
										{formatDistanceToNow(new Date(thread.updatedAt), {
											addSuffix: true,
										})}
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
