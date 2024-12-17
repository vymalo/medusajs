import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { EventType, WebhookWithData } from '../types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

type Data = Extract<
	WebhookWithData,
	{
		type: 'order_canceled';
	}
>['data'];

export default async function printfulOrder_canceled({
	event: {
		data: { order, reason },
	},
	container,
}: SubscriberArgs<Data>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const orderService = container.resolve(Modules.ORDER);
	logger.log(`Printful order ${order.id} was canceled: ${reason}`);

	try {
		const orderId = order.external_id;
		await orderService.cancel(orderId);
		logger.log(`Order ${orderId} was canceled`);
	} catch (e) {
		logger.error(`Error canceling printful order "${order?.id}":`, e as Error);
	}
}

export const config: SubscriberConfig = {
	event: 'printful.order_canceled',
} as { event: EventType };
