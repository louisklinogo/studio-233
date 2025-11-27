import { useEffect, useState } from "react";

export function useUIState() {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
	const [showGrid, setShowGrid] = useState(false);
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
		isSettingsDialogOpen,
		setIsSettingsDialogOpen,
		showGrid,
		setShowGrid,
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
