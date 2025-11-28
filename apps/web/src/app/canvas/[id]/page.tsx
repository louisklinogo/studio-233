import { notFound } from "next/navigation";
import { use } from "react";
import { OverlayInterface } from "@/components/canvas/OverlayInterface";

export default function CanvasPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	if (!id || id === "undefined" || id === "null") {
		notFound();
	}

	return <OverlayInterface />;
}
