import { useEffect, useState } from "react";

export const useCalibration = (isDataReady: boolean) => {
	const [isCalibrated, setIsCalibrated] = useState(false);
	const [shouldShowBoot, setShouldShowBoot] = useState(true);

	useEffect(() => {
		// Check session storage to avoid annoying power users
		const hasBooted = sessionStorage.getItem("studio_has_booted");

		if (hasBooted) {
			// Fast boot for refresh (300ms) just to hide the raw mounting
			setShouldShowBoot(false); // Don't show the full animation component
			setTimeout(() => setIsCalibrated(true), 300);
		} else {
			// Full boot for new session
			setShouldShowBoot(true);
		}
	}, []);

	const handleAnimationComplete = () => {
		// Only mark as calibrated if data is also ready
		// If data isn't ready, we might want to keep a spinner, but for now, we let it through
		// and let the UI handle the loading state (skeletons)
		setIsCalibrated(true);
		sessionStorage.setItem("studio_has_booted", "true");
	};

	return {
		isCalibrated: isCalibrated && isDataReady, // Gated by data readiness
		shouldShowBoot,
		handleAnimationComplete,
	};
};
