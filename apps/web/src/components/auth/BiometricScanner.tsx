import { motion } from "framer-motion";
import { Fingerprint, ShieldCheck } from "lucide-react";

export function BiometricScanner({
	onScan,
	isScanning,
}: {
	onScan: () => void;
	isScanning: boolean;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-8 gap-6">
			<button
				onClick={onScan}
				className="relative group cursor-pointer outline-none"
				aria-label="Biometric Authentication"
			>
				{/* Minimal Ring */}
				<motion.div
					animate={
						isScanning
							? { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }
							: { scale: 1, opacity: 0.2 }
					}
					transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -inset-4 rounded-full border border-[#FF4D00]"
				/>

				{/* Core Button */}
				<div className="relative w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center transition-colors group-hover:border-[#FF4D00]">
					{isScanning ? (
						<ShieldCheck className="w-8 h-8 text-[#FF4D00] animate-pulse" />
					) : (
						<Fingerprint className="w-8 h-8 text-neutral-400 group-hover:text-[#FF4D00] transition-colors duration-300" />
					)}
				</div>
			</button>

			<div className="text-center space-y-1">
				<h3 className="font-sans text-sm font-bold text-neutral-900 dark:text-neutral-100">
					Biometric Access
				</h3>
				<p className="font-mono text-[10px] text-neutral-500">
					USE HARDWARE KEY
				</p>
			</div>
		</div>
	);
}
