import { StudioLogo } from "@/components/icons/StudioLogo";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
	isLoading: boolean;
	loadingMessage?: string;
}

export function LoadingAnimation({
	isLoading,
	loadingMessage,
}: LoadingAnimationProps) {
	return (
		<div className="my-24 flex flex-col">
			<div className="mb-6 h-20 w-20 flex items-center justify-center">
				<StudioLogo
					variant="icon"
					className={cn(
						"text-6xl text-primary transition-all",
						"data-[loading=true]:animate-logo-spin",
					)}
					data-loading={isLoading}
				/>
			</div>
			<p className="text-center font-light italic">
				{isLoading ? loadingMessage : "Waiting for your input..."}
			</p>
		</div>
	);
}
