import React from "react";
import { Button } from "@/components/ui/button";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
	title,
	description,
	icon,
	onClick,
}) => {
	return (
		<button
			onClick={onClick}
			className="group relative flex w-full overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#111111] p-4 text-left transition-all hover:border-[#3B4B59] hover:shadow-sm"
		>
			<div className="relative z-10 flex flex-col gap-3">
				<div className="flex h-8 w-8 items-center justify-center rounded-sm bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 transition-colors group-hover:bg-[#3B4B59] group-hover:text-white">
					{icon}
				</div>
				<div className="space-y-1">
					<h3 className="font-medium leading-none tracking-tight font-mono uppercase text-sm">
						{title}
					</h3>
					<p className="text-xs text-neutral-500 line-clamp-2">{description}</p>
				</div>
			</div>

			<div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
				<SwissIcons.ArrowRight className="h-4 w-4 text-[#3B4B59]" />
			</div>
		</button>
	);
};

interface ChatWelcomeProps {
	onSelectTemplate: (template: string) => void;
	userName?: string;
}

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({
	onSelectTemplate,
	userName = "Louis Klinogo",
}) => {
	return (
		<div className="flex flex-1 flex-col justify-center px-4 py-8 bg-[#f4f4f0] dark:bg-[#111111]">
			<div className="mb-8 space-y-2">
				<div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#3B4B59] text-white mb-4 shadow-sm">
					<SwissIcons.Sparkles className="h-5 w-5" />
				</div>
				<h1 className="text-2xl font-semibold tracking-tight font-mono uppercase">
					System Online
				</h1>
				<p className="text-lg text-neutral-500">Awaiting command input...</p>
			</div>

			<div className="grid gap-4">
				<TemplateCard
					title="Wine List"
					description="Generate a poster of wine bottles."
					icon={<SwissIcons.Sparkles className="h-4 w-4" />}
					onClick={() =>
						onSelectTemplate(
							"Generate a wine list poster mimicking the style...",
						)
					}
				/>
				<TemplateCard
					title="Branding"
					description="Create a coffee shop brand identity."
					icon={<SwissIcons.Signal className="h-4 w-4" />}
					onClick={() =>
						onSelectTemplate("Create a coffee shop branding package...")
					}
				/>
				<TemplateCard
					title="Storyboard"
					description="Generate a visual storyboard sequence."
					icon={<SwissIcons.Sequence className="h-4 w-4" />}
					onClick={() => onSelectTemplate("Create a storyboard for...")}
				/>
			</div>

			<div className="mt-8 flex items-center gap-2 text-xs text-neutral-500">
				<Button
					variant="ghost"
					size="sm"
					className="h-auto p-0 text-xs font-normal hover:bg-transparent hover:text-[#3B4B59] font-mono uppercase"
				>
					<SwissIcons.ArrowRight className="mr-1 h-3 w-3" />
					View all protocols
				</Button>
			</div>
		</div>
	);
};
