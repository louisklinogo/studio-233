import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
	size?: number;
}

export const SwissIcons = {
	// SECURITY -> The Lock (Protection)
	Lock: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="5"
				y="11"
				width="14"
				height="10"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="2" />
			<circle cx="12" cy="16" r="1" fill="currentColor" />
		</svg>
	),

	// COMMUNICATION -> The Mail (Message)
	Mail: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="2"
				y="4"
				width="20"
				height="16"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// UI -> The Check (Validation)
	Check: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M20 6L9 17L4 12"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

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

	// ACTIONS -> The Plus (Addition)
	Plus: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="11" y="4" width="2" height="16" fill="currentColor" />
			<rect x="4" y="11" width="16" height="2" fill="currentColor" />
		</svg>
	),

	// ACTIONS -> The Close (Termination)
	Close: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M18 6L6 18"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M6 6L18 18"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

	// NAV -> The Arrow (Direction)
	ArrowUpRight: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M7 17L17 7"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M7 7H17V17"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

	// NAV -> The Arrow Down (Insertion)
	ArrowDown: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12 4V20"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M5 13L12 20L19 13"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

	// OPTIONS -> The More (Ellipsis)
	More: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="4" y="10" width="4" height="4" fill="currentColor" />
			<rect x="10" y="10" width="4" height="4" fill="currentColor" />
			<rect x="16" y="10" width="4" height="4" fill="currentColor" />
		</svg>
	),

	// EDIT -> The Pencil (Modification)
	// EDIT -> The Cursor (Modification)
	Edit: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="10" y="4" width="4" height="16" fill="currentColor" />
		</svg>
	),

	// COPY -> The Clone (Replication)
	Copy: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="8"
				y="8"
				width="12"
				height="12"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M16 8V4H4V16H8" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TRASH -> The Bin (Deletion)
	// TRASH -> The Void (Deletion)
	Trash: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
			<path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// LOADING -> The Spinner (Process)
	Spinner: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12 2V6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M12 18V22"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M4.92893 4.92893L7.75736 7.75736"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M16.2426 16.2426L19.0711 19.0711"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M2 12H6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M18 12H22"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M4.92893 19.0711L7.75736 16.2426"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M16.2426 7.75736L19.0711 4.92893"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

	// MEDIA -> The Image (Visual)
	// MEDIA -> The Ratio (Visual)
	Image: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="3"
				y="4"
				width="18"
				height="16"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M3 20L21 4" stroke="currentColor" strokeWidth="1" />
		</svg>
	),

	// MEDIA -> The Video (Motion)
	// MEDIA -> The Sequence (Motion)
	Video: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="2" y="8" width="6" height="8" fill="currentColor" />
			<rect x="9" y="8" width="6" height="8" fill="currentColor" />
			<rect x="16" y="8" width="6" height="8" fill="currentColor" />
		</svg>
	),

	// AI -> The Zap (Generation/Energy)
	// AI -> The Pulse (Generation)
	Zap: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M2 12C2 12 5 4 8 12C11 20 13 4 16 12C19 20 22 12 22 12"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

	// MEDIA -> The Film (Sequence)
	// MEDIA -> The Stream (Sequence)
	Film: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="5" y="4" width="2" height="16" fill="currentColor" />
			<rect x="11" y="4" width="2" height="16" fill="currentColor" />
			<rect x="17" y="4" width="2" height="16" fill="currentColor" />
		</svg>
	),

	// ACTIONS -> The Upload (Input)
	// ACTIONS -> Input Vector (Upload)
	Upload: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="4"
				y="4"
				width="16"
				height="16"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M12 16V8" stroke="currentColor" strokeWidth="2" />
			<path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TOOLS -> The Cursor (Select)
	// TOOLS -> Target (Select)
	Cursor: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
			<path d="M12 2V6" stroke="currentColor" strokeWidth="2" />
			<path d="M12 18V22" stroke="currentColor" strokeWidth="2" />
			<path d="M2 12H6" stroke="currentColor" strokeWidth="2" />
			<path d="M18 12H22" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TOOLS -> The Hand (Pan)
	// TOOLS -> Pan (Move)
	Hand: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M12 3V21" stroke="currentColor" strokeWidth="2" />
			<path d="M3 12H21" stroke="currentColor" strokeWidth="2" />
			<path d="M12 3L9 6M12 3L15 6" stroke="currentColor" strokeWidth="2" />
			<path d="M12 21L9 18M12 21L15 18" stroke="currentColor" strokeWidth="2" />
			<path d="M3 12L6 9M3 12L6 15" stroke="currentColor" strokeWidth="2" />
			<path d="M21 12L18 9M21 12L18 15" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TOOLS -> The Type (Text)
	Type: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M4 7V4H20V7" stroke="currentColor" strokeWidth="2" />
			<path d="M12 4V20" stroke="currentColor" strokeWidth="2" />
			<path d="M8 20H16" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TOOLS -> The Shape (Object)
	Shape: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="3"
				y="3"
				width="18"
				height="18"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// ACTIONS -> The Minus (Reduction)
	Minus: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="4" y="11" width="16" height="2" fill="currentColor" />
		</svg>
	),

	// HISTORY -> The Undo (Revert)
	Undo: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M3 9H14C17.3137 9 20 11.6863 20 15V18"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M8 4L3 9L8 14" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// HISTORY -> The Redo (Advance)
	Redo: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M21 9H10C6.68629 9 4 11.6863 4 15V18"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M16 4L21 9L16 14" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// VIEW -> The Maximize (Fit)
	Maximize: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" />
			<path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" />
			<path d="M21 15V21H15" stroke="currentColor" strokeWidth="2" />
			<path d="M3 9V3H9" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// UI -> The Chevron Down (Expand)
	ChevronDown: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// UI -> The History (Time)
	History: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.6 2.3 15.1 2.9 16.5"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" />
			<path d="M2.5 21.5L6 16M1 16H6" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// UI -> The Chevron Up (Collapse)
	ChevronUp: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// MEDIA -> The Play (Start)
	Play: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
		</svg>
	),

	// MEDIA -> The Pause (Stop)
	Pause: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="6" y="4" width="4" height="16" fill="currentColor" />
			<rect x="14" y="4" width="4" height="16" fill="currentColor" />
		</svg>
	),

	// MEDIA -> The Skip Back (Rewind)
	SkipBack: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M19 20L9 12L19 4V20Z" fill="currentColor" />
			<rect x="5" y="4" width="2" height="16" fill="currentColor" />
		</svg>
	),

	// MEDIA -> The Skip Forward (Advance)
	SkipForward: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M5 4L15 12L5 20V4Z" fill="currentColor" />
			<rect x="17" y="4" width="2" height="16" fill="currentColor" />
		</svg>
	),

	// MEDIA -> The Repeat (Loop)
	Repeat: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M17 1H21V5" stroke="currentColor" strokeWidth="2" />
			<path d="M7 23H3V19" stroke="currentColor" strokeWidth="2" />
			<path
				d="M21 1H7C4.79086 1 3 2.79086 3 5V14"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M3 23H17C19.2091 23 21 21.2091 21 19V10"
				stroke="currentColor"
				strokeWidth="2"
			/>
		</svg>
	),

	// MEDIA -> The Volume (Sound)
	// MEDIA -> Signal (Volume)
	Volume: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="4" y="14" width="4" height="6" fill="currentColor" />
			<rect x="10" y="10" width="4" height="10" fill="currentColor" />
			<rect x="16" y="4" width="4" height="16" fill="currentColor" />
		</svg>
	),

	// MEDIA -> The Mute (Silence)
	Mute: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
			<path d="M23 9L17 15" stroke="currentColor" strokeWidth="2" />
			<path d="M17 9L23 15" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TOOLS -> The Crop (Trim)
	Crop: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M6 2V18H22" stroke="currentColor" strokeWidth="2" />
			<path d="M18 22V6H2" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TOOLS -> The Scissors (Cut/Remove BG)
	// TOOLS -> Split (Cut)
	Scissors: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M4 20L20 4" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// TOOLS -> The Filter (Isolate)
	// TOOLS -> Sort (Filter)
	Filter: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="4" y="6" width="16" height="2" fill="currentColor" />
			<rect x="6" y="11" width="12" height="2" fill="currentColor" />
			<rect x="8" y="16" width="8" height="2" fill="currentColor" />
		</svg>
	),

	// ACTIONS -> The Download (Save)
	Download: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" />
			<path d="M12 15V3" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// LAYERS -> The Layers (Stack)
	// LAYERS -> The Stack (Layers)
	Layers: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="2"
				y="4"
				width="20"
				height="4"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<rect
				x="2"
				y="10"
				width="20"
				height="4"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<rect
				x="2"
				y="16"
				width="20"
				height="4"
				stroke="currentColor"
				strokeWidth="2"
			/>
		</svg>
	),

	// LAYERS -> Bring To Front
	BringToFront: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="8"
				y="8"
				width="8"
				height="8"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M8 22V18" stroke="currentColor" strokeWidth="2" />
			<path d="M8 6V2" stroke="currentColor" strokeWidth="2" />
			<path d="M2 8H6" stroke="currentColor" strokeWidth="2" />
			<path d="M22 8H18" stroke="currentColor" strokeWidth="2" />
			<path d="M12 2V6" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// LAYERS -> Send To Back
	SendToBack: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="8"
				y="8"
				width="8"
				height="8"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M16 22V18" stroke="currentColor" strokeWidth="2" />
			<path d="M16 6V2" stroke="currentColor" strokeWidth="2" />
			<path d="M2 16H6" stroke="currentColor" strokeWidth="2" />
			<path d="M22 16H18" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// NAV -> Arrow Up (Move Up)
	ArrowUp: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M12 19V5" stroke="currentColor" strokeWidth="2" />
			<path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// UI -> The Grip (Drag)
	Grip: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="9" cy="9" r="1" fill="currentColor" />
			<circle cx="9" cy="15" r="1" fill="currentColor" />
			<circle cx="15" cy="9" r="1" fill="currentColor" />
			<circle cx="15" cy="15" r="1" fill="currentColor" />
		</svg>
	),

	// ACTIONS -> Combine (Merge)
	Combine: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="2"
				y="2"
				width="10"
				height="10"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<rect
				x="12"
				y="12"
				width="10"
				height="10"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M12 2H22V12"
				stroke="currentColor"
				strokeWidth="2"
				strokeDasharray="4 4"
			/>
			<path
				d="M2 12V22H12"
				stroke="currentColor"
				strokeWidth="2"
				strokeDasharray="4 4"
			/>
		</svg>
	),

	// ACTIONS -> File Plus (Extend)
	// ACTIONS -> File Plus (Extend)
	// ACTIONS -> New Object (FilePlus)
	FilePlus: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect
				x="4"
				y="4"
				width="12"
				height="16"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path d="M18 8V14" stroke="currentColor" strokeWidth="2" />
			<path d="M15 11H21" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// AI -> Sparkles (Magic)
	Sparkles: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
				fill="currentColor"
			/>
		</svg>
	),

	// ACTIONS -> Link (Connect)
	Link: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
			<path
				d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

	// NAV -> Globe (World)
	Globe: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
			<path d="M2 12h20" stroke="currentColor" strokeWidth="2" />
			<path
				d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
				stroke="currentColor"
				strokeWidth="2"
			/>
		</svg>
	),

	// NAV -> Arrow Right (Move Right)
	ArrowRight: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
			<path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	// ALIASES (Duplicated for safety)
	Target: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
			<path d="M12 2V6" stroke="currentColor" strokeWidth="2" />
			<path d="M12 18V22" stroke="currentColor" strokeWidth="2" />
			<path d="M2 12H6" stroke="currentColor" strokeWidth="2" />
			<path d="M18 12H22" stroke="currentColor" strokeWidth="2" />
		</svg>
	),

	Pulse: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M2 12C2 12 5 4 8 12C11 20 13 4 16 12C19 20 22 12 22 12"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="square"
			/>
		</svg>
	),

	Signal: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="4" y="14" width="4" height="6" fill="currentColor" />
			<rect x="10" y="10" width="4" height="10" fill="currentColor" />
			<rect x="16" y="4" width="4" height="16" fill="currentColor" />
		</svg>
	),

	Sequence: ({ size = 24, ...props }: IconProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<rect x="2" y="8" width="6" height="8" fill="currentColor" />
			<rect x="9" y="8" width="6" height="8" fill="currentColor" />
			<rect x="16" y="8" width="6" height="8" fill="currentColor" />
		</svg>
	),
};
