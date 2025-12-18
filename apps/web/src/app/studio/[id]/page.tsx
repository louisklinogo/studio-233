import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { StudioOperatorClient } from "@/components/studio-workflow/StudioOperatorClient";

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
		<Suspense fallback={null}>
			<StudioContent params={params} />
		</Suspense>
	);
}
