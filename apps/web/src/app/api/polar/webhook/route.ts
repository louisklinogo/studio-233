import {
	validateEvent,
	WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import type { PolarSubscriptionEvent } from "@studio233/auth";
import { polarWebhookHandler } from "@studio233/auth";
import { NextResponse } from "next/server";

const SUPPORTED_EVENTS = new Set<PolarSubscriptionEvent["type"]>([
	"subscription.created",
	"subscription.updated",
	"subscription.active",
	"subscription.canceled",
]);

export async function POST(request: Request) {
	const secret = process.env.POLAR_WEBHOOK_SECRET;
	if (!secret) {
		return NextResponse.json(
			{ error: "POLAR_WEBHOOK_SECRET is not configured" },
			{ status: 500 },
		);
	}

	const rawBody = await request.text();
	const headerRecord = Object.fromEntries(request.headers.entries());

	try {
		const event = validateEvent(rawBody, headerRecord, secret);
		if (SUPPORTED_EVENTS.has(event.type as PolarSubscriptionEvent["type"])) {
			await polarWebhookHandler.handle(event as PolarSubscriptionEvent);
		}
		return NextResponse.json({ received: true });
	} catch (error) {
		if (error instanceof WebhookVerificationError) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}
		console.error("Polar webhook error", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}
}
