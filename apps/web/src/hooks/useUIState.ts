import { useEffect, useState } from "react";

export function useUIState() {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isBrandArchiveOpen, setIsBrandArchiveOpen] = useState(false);
	const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
	const [showGrid, setShowGrid] = useState(false);
	const [snapToGrid, setSnapToGrid] = useState(false);
	const [gridSize, setGridSize] = useState(40);
	const [showMinimap, setShowMinimap] = useState(true);
	const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
	const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
	const [customApiKey, setCustomApiKey] = useState<string>("");
	const [tempApiKey, setTempApiKey] = useState<string>("");
	const [themeColor, setThemeColor] = useState<"obsidian" | "sage" | "stone">(
		"obsidian",
	);

	// Load API key from localStorage on mount
	useEffect(() => {
		const savedKey = localStorage.getItem("fal-api-key");
		if (savedKey) {
			setCustomApiKey(savedKey);
			setTempApiKey(savedKey);
		}
	}, []);

	// Load theme color from localStorage on mount
	useEffect(() => {
		const savedTheme = localStorage.getItem("themeColor");
		if (savedTheme && ["obsidian", "sage", "stone"].includes(savedTheme)) {
			setThemeColor(savedTheme as "obsidian" | "sage" | "stone");
		}
	}, []);

	// Apply theme color class to body
	useEffect(() => {
		// Remove old theme classes
		document.body.classList.remove(
			"theme-obsidian",
			"theme-sage",
			"theme-stone",
		);
		// Add new theme class
		document.body.classList.add(`theme-${themeColor}`);
		// Save to storage
		localStorage.setItem("themeColor", themeColor);
	}, [themeColor]);

	// Load grid setting from localStorage on mount
	useEffect(() => {
		const savedShowGrid = localStorage.getItem("studio_showGrid_v2");
		if (savedShowGrid !== null) {
			setShowGrid(savedShowGrid === "true");
		}

		const savedSnapToGrid = localStorage.getItem("studio_snapToGrid");
		if (savedSnapToGrid !== null) {
			setSnapToGrid(savedSnapToGrid === "true");
		}

		const savedGridSize = localStorage.getItem("studio_gridSize");
		if (savedGridSize !== null) {
			const parsed = Number.parseInt(savedGridSize, 10);
			if (!Number.isNaN(parsed) && parsed > 0) {
				setGridSize(parsed);
			}
		}
	}, []);

	// Load minimap setting from localStorage on mount
	useEffect(() => {
		const savedShowMinimap = localStorage.getItem("showMinimap");
		if (savedShowMinimap !== null) {
			setShowMinimap(savedShowMinimap === "true");
		}
	}, []);

	// Save grid setting to localStorage when it changes
	useEffect(() => {
		localStorage.setItem("studio_showGrid_v2", showGrid.toString());
	}, [showGrid]);

	useEffect(() => {
		localStorage.setItem("studio_snapToGrid", snapToGrid.toString());
	}, [snapToGrid]);

	useEffect(() => {
		localStorage.setItem("studio_gridSize", gridSize.toString());
	}, [gridSize]);

	// Save minimap setting to localStorage when it changes
	useEffect(() => {
		localStorage.setItem("showMinimap", showMinimap.toString());
	}, [showMinimap]);

	// Save API key to localStorage when it changes
	useEffect(() => {
		if (customApiKey) {
			localStorage.setItem("fal-api-key", customApiKey);
		} else {
			localStorage.removeItem("fal-api-key");
		}
	}, [customApiKey]);

	return {
		isChatOpen,
		setIsChatOpen,
		isBrandArchiveOpen,
		setIsBrandArchiveOpen,
		isSettingsDialogOpen,
		setIsSettingsDialogOpen,
		showGrid,
		setShowGrid,
		snapToGrid,
		setSnapToGrid,
		gridSize,
		setGridSize,
		showMinimap,
		setShowMinimap,
		isStyleDialogOpen,
		setIsStyleDialogOpen,
		isApiKeyDialogOpen,
		setIsApiKeyDialogOpen,
		customApiKey,
		setCustomApiKey,
		tempApiKey,
		setTempApiKey,
		themeColor,
		setThemeColor,
	};
}
