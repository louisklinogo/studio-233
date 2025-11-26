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
			className="group border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 p-4 flex flex-col gap-4 min-h-[160px] relative overflow-hidden"
		>
			<div className="flex justify-between items-start">
				<div className="w-8 h-8 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black flex items-center justify-center text-neutral-600 font-mono text-xs">
					{project.name.slice(0, 2).toUpperCase()}
				</div>
				<ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-[#FF4D00] transition-colors" />
			</div>

			<div className="mt-auto">
				<h3 className="font-bold text-neutral-900 dark:text-neutral-200 group-hover:text-[#FF4D00] dark:group-hover:text-white transition-colors truncate">
					{project.name}
				</h3>
				<p className="text-[10px] font-mono text-neutral-500 mt-1">
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
