import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
	console.log("[Upload API] Request received");
	const body = (await request.json()) as HandleUploadBody;

	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (
				pathname: string,
				/* clientPayload */
			) => {
				console.log("[Upload API] Generating token for:", pathname);
				const headers = new Headers(request.headers);

				let session;
				try {
					session = await getSessionWithRetry(headers);
				} catch (sessionError) {
					console.error("[Upload API] Session retrieval failed:", sessionError);
					throw new Error("SESSION_RETRIEVAL_FAULT");
				}

				if (!session) {
					console.warn("[Upload API] Unauthorized attempt");
					throw new Error("UNAUTHORIZED_UPLOAD_REQUEST");
				}

				console.log("[Upload API] Authorized user:", session.user.id);

				return {
					allowedContentTypes: [
						"image/jpeg",
						"image/png",
						"image/gif",
						"image/webp",
						"application/pdf",
					],
					addRandomSuffix: true,
					tokenPayload: JSON.stringify({
						userId: session.user.id,
					}),
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				console.log("[Upload API] Upload completed:", blob.url);
			},
		});

		return NextResponse.json(jsonResponse);
	} catch (error) {
		console.error("[Upload API] Error handled:", error);
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}
