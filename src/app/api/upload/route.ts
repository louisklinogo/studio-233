import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
	const body = (await request.json()) as HandleUploadBody;

	try {
		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (
				pathname: string,
				/* clientPayload */
			) => {
				// Generate a client token for the browser to upload the file
				// ⚠️ Authenticate and authorize users before generating the token.
				// Otherwise, you're allowing anonymous uploads.

				// TODO: Add authentication check here if needed
				// const user = await auth.currentUser();
				// if (!user) throw new Error('Unauthorized');

				return {
					allowedContentTypes: [
						"image/jpeg",
						"image/png",
						"image/gif",
						"image/webp",
					],
					tokenPayload: JSON.stringify({
						// optional, sent to your server on upload completion
						// you could pass a user id or other metadata here
					}),
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				// Get notified of client upload completion
				// ⚠️ This will not work on `localhost` websites,
				// Use ngrok or similar to get the full upload flow
				console.log("blob uploaded", blob.url);
			},
		});

		return NextResponse.json(jsonResponse);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 }, // The webhook will retry 5 times automatically if the status code is 500-599
		);
	}
}
