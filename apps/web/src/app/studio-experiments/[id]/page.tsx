import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { EnhancedStudioExperimentsClient } from "@/components/studio-workflow/EnhancedStudioExperimentsClient";

type Params = { id: string };

function PageContent({ params }: { params: Promise<Params> }) {
	const { id } = use(params);

	if (!id || id === "undefined" || id === "null") {
		notFound();
	}

	return <EnhancedStudioExperimentsClient projectId={id} />;
}

export default function StudioExperimentsPage({
	params,
}: {
	params: Promise<Params>;
}) {
	return (
		<Suspense fallback={null}>
			<PageContent params={params} />
		</Suspense>
	);
}
