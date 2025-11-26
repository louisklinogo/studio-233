import React from "react";

interface SwissInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SwissInput({ className, ...props }: SwissInputProps) {
	return (
		<div className="relative group">
			<input
				{...props}
				className={`
          w-full bg-transparent 
          border-b-2 border-neutral-200 dark:border-neutral-800 
          py-4 text-3xl md:text-5xl font-black tracking-tighter 
          text-neutral-900 dark:text-white
          placeholder:text-neutral-200 dark:placeholder:text-neutral-800
          focus:outline-none focus:border-[#FF4D00]
          transition-colors duration-300
          ${className}
        `}
			/>
			<span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FF4D00] transition-all duration-500 group-focus-within:w-full" />
		</div>
	);
}
