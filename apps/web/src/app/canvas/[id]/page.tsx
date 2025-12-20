import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { OverlayInterface } from "@/components/canvas/OverlayInterface";
import { Viewfinder3D } from "@/components/ui/Viewfinder3D";

type CanvasParams = { id: string };

function CanvasContent({ params }: { params: Promise<CanvasParams> }) {
	const { id } = use(params);

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
		<Suspense fallback={<Viewfinder3D label="CALIBRATING_CANVAS" />}>
			<CanvasContent params={params} />
		</Suspense>
	);
}
