import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { OrderDTO } from '@medusajs/framework/types';
import { PrintfulModules } from '../utils';

export default async function orderCanceled({
	event: { data: order },
	container,
}: SubscriberArgs<OrderDTO>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	logger.log(`Order ${order.id} was canceled`);

	try {
		const printful = container.resolve(PrintfulModules.printful);
		const orderId = order.id;
		await printful.cancelOrder(`@${orderId}`, container);
		logger.log(`Printful Order ${orderId} was canceled`);
	} catch (e) {
		logger.error(`Error canceling order ${order.id}:`, e as Error);
	}
}

export const config: SubscriberConfig = {
	event: 'order.canceled',
};
