import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { PrintfulModules } from '../utils';

export default async function orderPlaced({
	event: {
		data: { id: orderId },
	},
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const printfulService = container.resolve(PrintfulModules.printful);
	const orderService = container.resolve(Modules.ORDER);

	try {
		const order = await orderService.retrieveOrder(orderId);

		if (!order) {
			logger.error(`Order ${orderId} not found`);
			return;
		}

		const printfulOrder = await printfulService.createOrder(order, container);
		logger.log(`Printful Order ${printfulOrder.id} was placed`);
	} catch (e) {
		logger.error(`Error placing order ${orderId}:`, e as Error);
	}
}

export const config: SubscriberConfig = {
	event: 'order.placed',
};
