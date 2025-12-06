import { notFound } from "next/navigation";
import { OverlayInterface } from "@/components/canvas/OverlayInterface";

type CanvasParams = { id: string };

export default async function CanvasPage({
	params,
}: {
	params: Promise<CanvasParams>;
}) {
	const { id } = await params;

	if (!id || id === "undefined" || id === "null") {
		notFound();
	}

	return <OverlayInterface projectId={id} />;
}
