import { useEffect, useState } from "react";

export function useUIState() {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
	const [showGrid, setShowGrid] = useState(true);
	const [showMinimap, setShowMinimap] = useState(true);
	const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
	const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
	const [customApiKey, setCustomApiKey] = useState<string>("");
	const [tempApiKey, setTempApiKey] = useState<string>("");

	// Load API key from localStorage on mount
	useEffect(() => {
		const savedKey = localStorage.getItem("fal-api-key");
		if (savedKey) {
			setCustomApiKey(savedKey);
			setTempApiKey(savedKey);
		}
	}, []);

	// Load grid setting from localStorage on mount
	useEffect(() => {
		const savedShowGrid = localStorage.getItem("showGrid");
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
		localStorage.setItem("showGrid", showGrid.toString());
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
	};
}
