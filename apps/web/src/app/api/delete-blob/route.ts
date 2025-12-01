import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { urls } = body;

		if (!urls || !Array.isArray(urls) || urls.length === 0) {
			return NextResponse.json(
				{ error: "No URLs provided for deletion" },
				{ status: 400 },
			);
		}

		// Delete all blobs
		const deletePromises = urls.map((url: string) => del(url));
		await Promise.all(deletePromises);

		return NextResponse.json({
			success: true,
			message: `Successfully deleted ${urls.length} blob(s)`,
		});
	} catch (error) {
		console.error("Error deleting blobs:", error);
		return NextResponse.json(
			{ error: "Failed to delete blobs" },
			{ status: 500 },
		);
	}
}
