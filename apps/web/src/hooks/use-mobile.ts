import * as React from "react";

const DEFAULT_QUERY = "(max-width: 768px)";

export function useIsMobile(query: string = DEFAULT_QUERY) {
	const getMatch = React.useCallback(() => {
		if (typeof window === "undefined") {
			return false;
		}
		return window.matchMedia(query).matches;
	}, [query]);

	const [isMobile, setIsMobile] = React.useState(getMatch);

	React.useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mediaQuery = window.matchMedia(query);
		const handleChange = (event: MediaQueryListEvent) => {
			setIsMobile(event.matches);
		};

		setIsMobile(mediaQuery.matches);
		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, [query]);

	return isMobile;
}
