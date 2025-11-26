import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
	project: {
		id: string;
		name: string;
		updatedAt: Date;
		thumbnail: string | null;
	};
}

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<Link
			href={`/canvas/${project.id}`}
			className="group border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 p-4 flex flex-col gap-4 min-h-[160px] relative overflow-hidden"
		>
			{/* Scanline Overlay */}
			<div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.02)_50%)] bg-[size:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

			{/* Corner Bracket Reveal */}
			<div className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-transparent border-r-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			<div className="flex justify-between items-start relative z-10">
				<div className="w-8 h-8 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black flex items-center justify-center text-neutral-600 font-mono text-xs group-hover:border-[#FF4D00] group-hover:text-[#FF4D00] transition-colors">
					{project.name.slice(0, 2).toUpperCase()}
				</div>
				<ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#FF4D00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
			</div>

			<div className="mt-auto relative z-10">
				<h3 className="font-bold text-neutral-900 dark:text-neutral-200 group-hover:text-[#FF4D00] dark:group-hover:text-white transition-colors truncate tracking-tight">
					{project.name}
				</h3>
				<p className="text-[10px] font-mono text-neutral-500 mt-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
					LAST_EDIT: {new Date(project.updatedAt).toLocaleDateString()}
				</p>
			</div>
		</Link>
	);
}

export function CreateProjectCard() {
	return (
		<button className="group border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-[#FF4D00]/50 hover:bg-[#FF4D00]/5 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 min-h-[160px]">
			<div className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 group-hover:border-[#FF4D00] group-hover:text-[#FF4D00] text-neutral-500 flex items-center justify-center transition-colors">
				<Plus className="w-5 h-5" />
			</div>
			<span className="font-mono text-xs text-neutral-500 group-hover:text-[#FF4D00] transition-colors uppercase tracking-widest">
				Init_Canvas
			</span>
		</button>
	);
}
