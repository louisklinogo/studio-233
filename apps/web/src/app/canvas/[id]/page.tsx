import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OverlayInterface } from "@/components/canvas/OverlayInterface";

type CanvasParams = { id: string };

async function CanvasContent({ params }: { params: Promise<CanvasParams> }) {
	const { id } = await params;

	if (!id || id === "undefined" || id === "null") {
		notFound();
	}

	return <OverlayInterface projectId={id} />;
}

export default function CanvasPage({
	params,
}: {
	params: Promise<CanvasParams>;
}) {
	return (
		<Suspense fallback={null}>
			<CanvasContent params={params} />
		</Suspense>
	);
}
