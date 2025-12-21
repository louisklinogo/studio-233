import { notFound } from "next/navigation";
import { use } from "react";
import { OverlayInterface } from "@/components/canvas/OverlayInterface";

type CanvasParams = { id: string };

export default function CanvasPage({
	params,
}: {
	params: Promise<CanvasParams>;
}) {
	const { id } = use(params);

	if (!id || id === "undefined" || id === "null") {
		notFound();
	}

	return <OverlayInterface projectId={id} />;
}
