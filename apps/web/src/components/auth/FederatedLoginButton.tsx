import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const FederatedLoginButton = ({
	provider,
	onClick,
	isLoading,
}: {
	provider: "google";
	onClick: () => void;
	isLoading: boolean;
}) => {
	return (
		<button
			onClick={onClick}
			disabled={isLoading}
			className="relative w-full group h-16 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 overflow-hidden hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors disabled:opacity-50"
		>
			{/* Background Hover Effect */}
			<div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

			<div className="relative flex items-center justify-between px-4 h-full">
				<div className="flex items-center gap-4">
					{/* Icon Box */}
					<div className="w-10 h-10 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 group-hover:border-[#FF4D00]/50 transition-colors">
						{provider === "google" && (
							<svg
								className="w-5 h-5 text-neutral-900 dark:text-white"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
								<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
								<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
								<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
							</svg>
						)}
					</div>

					<div className="flex flex-col items-start">
						<span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
							{provider}_OAUTH
						</span>
						<span className="font-mono text-[9px] text-neutral-500 uppercase">
							CONNECT_VIA_FEDERATION_PROTOCOL
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="font-mono text-[9px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						INITIALIZE
					</span>
					<Check className="w-4 h-4 text-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				</div>
			</div>

			{/* Corner Accents */}
			<div className="absolute top-0 right-0 w-2 h-2 border-l border-b border-neutral-300 dark:border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity" />
			<div className="absolute bottom-0 left-0 w-2 h-2 border-r border-t border-neutral-300 dark:border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity" />
		</button>
	);
};
