import { motion } from "framer-motion";
import { Fingerprint, Scan, ShieldCheck } from "lucide-react";

export function BiometricScanner({
	onScan,
	isScanning,
}: {
	onScan: () => void;
	isScanning: boolean;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-8 gap-6">
			<div className="relative group cursor-pointer" onClick={onScan}>
				{/* Scanner Ring */}
				<motion.div
					animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
					transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
					className="absolute -inset-6 rounded-full border border-dashed border-emerald-500/30"
				/>
				<motion.div
					animate={isScanning ? { rotate: -360 } : { rotate: 0 }}
					transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
					className="absolute -inset-3 rounded-full border border-dotted border-emerald-500/50"
				/>

				{/* Core Scanner Button */}
				<div className="relative w-24 h-24 rounded-full bg-neutral-900/5 dark:bg-black/50 border border-emerald-500/20 flex items-center justify-center overflow-hidden group-hover:border-emerald-500/50 transition-colors duration-500">
					{/* Scan Line */}
					<motion.div
						animate={{ top: ["0%", "100%", "0%"] }}
						transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
						className="absolute left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
					/>

					{isScanning ? (
						<ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse" />
					) : (
						<Fingerprint className="w-10 h-10 text-neutral-400 group-hover:text-emerald-500 transition-colors duration-300" />
					)}
				</div>
			</div>

			<div className="text-center space-y-1">
				<h3 className="font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300 tracking-wider">
					BIOMETRIC_AUTH
				</h3>
				<p className="font-mono text-[10px] text-neutral-500 max-w-[200px]">
					INITIATE HARDWARE KEY SCAN FOR SECURE ACCESS
				</p>
			</div>
		</div>
	);
}
