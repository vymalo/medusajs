import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { EventType, WebhookWithData } from '../types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

type Data = Extract<
	WebhookWithData,
	{
		type: 'order_updated';
	}
>['data'];

export default async function printfulOrder_updated({
	event: {
		data: { order },
	},
	container,
}: SubscriberArgs<Data>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const orderId = order.id;
	logger.log(`Printful order ${orderId} was updated`);
}

export const config: SubscriberConfig = {
	event: 'printful.order_updated',
} as { event: EventType };
