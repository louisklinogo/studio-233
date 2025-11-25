import type { WebhookSubscriptionActivePayload } from "@polar-sh/sdk/models/components/webhooksubscriptionactivepayload";
import type { WebhookSubscriptionCanceledPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload";
import type { WebhookSubscriptionCreatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload";
import type { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload";
import { SubscriptionService } from "../services/subscription-service";

export type PolarSubscriptionEvent =
	| WebhookSubscriptionActivePayload
	| WebhookSubscriptionCanceledPayload
	| WebhookSubscriptionCreatedPayload
	| WebhookSubscriptionUpdatedPayload;

export class PolarWebhookHandler {
	constructor(private readonly subscriptions: SubscriptionService) {}

	async handle(event: PolarSubscriptionEvent) {
		await this.subscriptions.syncFromPolar(event.data, {
			eventType: event.type,
		});
	}
}
