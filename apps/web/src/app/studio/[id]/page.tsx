import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { StudioOperatorClient } from "@/components/studio-workflow/StudioOperatorClient";
import { Viewfinder3D } from "@/components/ui/Viewfinder3D";

type StudioParams = { id: string };

function StudioContent({ params }: { params: Promise<StudioParams> }) {
	const { id } = use(params);

	if (!id || id === "undefined" || id === "null") {
		notFound();
	}

	return <StudioOperatorClient projectId={id} />;
}

export default function StudioPage({
	params,
}: {
	params: Promise<StudioParams>;
}) {
	return (
		<Suspense fallback={<Viewfinder3D label="LINKING_SYSTEM_OPERATOR" />}>
			<StudioContent params={params} />
		</Suspense>
	);
}
