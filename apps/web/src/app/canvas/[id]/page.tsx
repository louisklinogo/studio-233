import { notFound } from "next/navigation";
import { OverlayInterface } from "@/components/canvas/OverlayInterface";

export default async function CanvasPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	if (!id || id === "undefined" || id === "null") {
		notFound();
	}

	return <OverlayInterface projectId={id} />;
}
