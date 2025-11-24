import { ArrowRight, Music, Video, Wand2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	color: string;
	onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
	title,
	description,
	icon,
	color,
	onClick,
}) => {
	return (
		<button
			onClick={onClick}
			className="group relative flex w-full overflow-hidden rounded-xl border bg-card p-4 text-left transition-all hover:border-ring/50 hover:shadow-md"
		>
			<div
				className={cn(
					"absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full opacity-10 blur-2xl",
					color,
				)}
			/>

			<div className="relative z-10 flex flex-col gap-3">
				<div
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-foreground transition-colors group-hover:bg-background",
						color,
					)}
				>
					{icon}
				</div>
				<div className="space-y-1">
					<h3 className="font-medium leading-none tracking-tight">{title}</h3>
					<p className="text-xs text-muted-foreground line-clamp-2">
						{description}
					</p>
				</div>
			</div>

			<div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
				<ArrowRight className="h-4 w-4 text-muted-foreground" />
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
		<div className="flex flex-1 flex-col justify-center px-4 py-8">
			<div className="mb-8 space-y-2">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
					<Wand2 className="h-5 w-5" />
				</div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Hi {userName},
				</h1>
				<p className="text-lg text-muted-foreground">
					What are we creating today?
				</p>
			</div>

			<div className="grid gap-4">
				<TemplateCard
					title="Wine List"
					description="Mimic this effect to generate a poster of wine bottles."
					icon={<Wand2 className="h-4 w-4" />}
					color="bg-blue-500/20 text-blue-600"
					onClick={() =>
						onSelectTemplate(
							"Generate a wine list poster mimicking the style...",
						)
					}
				/>
				<TemplateCard
					title="Coffee Shop Branding"
					description="You are a brand design expert, generate a coffee shop brand."
					icon={<Music className="h-4 w-4" />}
					color="bg-orange-500/20 text-orange-600"
					onClick={() =>
						onSelectTemplate("Create a coffee shop branding package...")
					}
				/>
				<TemplateCard
					title="Story Board"
					description="I NEED A STORY BOARD FOR THIS... "
					icon={<Video className="h-4 w-4" />}
					color="bg-yellow-500/20 text-yellow-600"
					onClick={() => onSelectTemplate("Create a storyboard for...")}
				/>
			</div>

			<div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
				<Button
					variant="ghost"
					size="sm"
					className="h-auto p-0 text-xs font-normal hover:bg-transparent hover:text-foreground"
				>
					<ArrowRight className="mr-1 h-3 w-3" />
					View all templates
				</Button>
			</div>
		</div>
	);
};
