export default function OnboardingLoading() {
	return (
		<div className="min-h-screen bg-[#e5e5e5] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 flex items-center justify-center px-6 py-16 relative overflow-hidden font-mono">
			{/* Background Grid */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none" />

			{/* Loading State */}
			<div className="flex flex-col items-center gap-6 z-10">
				{/* Precision Progress Bar */}
				<div className="w-48 h-[1px] bg-neutral-300 dark:bg-neutral-800 relative overflow-hidden">
					<div className="absolute top-0 left-0 h-full w-1/3 bg-[#FF4D00] animate-[shimmer_1.5s_infinite_linear]" />
				</div>

				{/* Label */}
				<p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-medium">
					Loading
				</p>
			</div>

			{/* Animation Keyframes */}
			<style>{`
				@keyframes shimmer {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(300%); }
				}
			`}</style>
		</div>
	);
}
