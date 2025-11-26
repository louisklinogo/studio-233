import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
	size?: number;
}

export const SwissIcons = {
	// HUB -> The Grid (Structure)
	Grid: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="2" y="2" width="9" height="9" fill="currentColor" />
			<rect x="13" y="2" width="9" height="9" fill="currentColor" />
			<rect x="2" y="13" width="9" height="9" fill="currentColor" />
			<rect x="13" y="13" width="9" height="9" fill="currentColor" />
		</svg>
	),

	// CANVAS -> The Frame (Workspace)
	Frame: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2 2H22V22H2V2ZM4 4V20H20V4H4Z"
				fill="currentColor"
			/>
		</svg>
	),

	// STUDIO -> The Circle (Focus)
	Circle: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
				fill="currentColor"
			/>
		</svg>
	),

	// SETTINGS -> The Slider (Control)
	Slider: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="2" y="4" width="20" height="2" fill="currentColor" />
			<rect x="2" y="11" width="20" height="2" fill="currentColor" />
			<rect x="2" y="18" width="20" height="2" fill="currentColor" />
			<rect x="6" y="2" width="4" height="6" fill="currentColor" />
			<rect x="14" y="9" width="4" height="6" fill="currentColor" />
			<rect x="4" y="16" width="4" height="6" fill="currentColor" />
		</svg>
	),

	// SYSTEM -> The Power (Energy)
	Power: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="11" y="2" width="2" height="10" fill="currentColor" />
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 22C16.4183 22 20 18.4183 20 14H18C18 17.3137 15.3137 20 12 20C8.68629 20 6 17.3137 6 14H4C4 18.4183 7.58172 22 12 22Z"
				fill="currentColor"
			/>
		</svg>
	),

	// THEME -> The Contrast (Duality)
	Contrast: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
			<path
				d="M12 3V21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"
				fill="currentColor"
			/>
		</svg>
	),
};
