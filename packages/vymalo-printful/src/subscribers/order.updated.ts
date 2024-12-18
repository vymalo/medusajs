import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/utils';
import { OrderDTO } from '@medusajs/types';

export default async function orderUpdated({
	event: { data: order },
	container,
}: SubscriberArgs<OrderDTO>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const orderId = order.id;
	logger.log(`Order ${orderId} was updated`);
}

export const config: SubscriberConfig = {
	event: 'order.updated',
};
