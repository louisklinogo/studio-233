import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(
	handler: () => void,
	excludeRefs: React.RefObject<HTMLElement>[] = [],
) {
	const ref = useRef<T>(null);

	useEffect(() => {
		const listener = (event: MouseEvent | TouchEvent) => {
			const target = event.target as Node;

			// Do nothing if clicking ref's element or descendent elements
			if (!ref.current || ref.current.contains(target)) {
				return;
			}

			// Do nothing if clicking excluded elements
			for (const excludeRef of excludeRefs) {
				if (excludeRef.current && excludeRef.current.contains(target)) {
					return;
				}
			}

			handler();
		};

		document.addEventListener("mousedown", listener);
		document.addEventListener("touchstart", listener);

		return () => {
			document.removeEventListener("mousedown", listener);
			document.removeEventListener("touchstart", listener);
		};
	}, [handler, excludeRefs]);

	return ref;
}
