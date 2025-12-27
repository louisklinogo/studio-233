import { batchStore } from "@studio233/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const ids = searchParams.get("ids")?.split(",") || [];

	if (ids.length === 0) {
		return NextResponse.json({ jobs: [] });
	}

	try {
		const jobs = await batchStore.getJobs(ids);
		// Filter out nulls if any keys were missing
		const validJobs = jobs.filter((job) => job !== null);
		return NextResponse.json({ jobs: validJobs });
	} catch (error) {
		console.error("Failed to fetch batch status:", error);
		return NextResponse.json(
			{ error: "Failed to fetch status" },
			{ status: 500 },
		);
	}
}
