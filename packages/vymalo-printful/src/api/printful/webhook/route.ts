import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { EventType, WebhookType, WebhookWithData } from '../../../types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export const POST = async (
	req: MedusaRequest<WebhookWithData>,
	res: MedusaResponse
) => {
	const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
	const eventBusService = req.scope.resolve('event_bus');

	try {
		const { data, type } = req.body;
		const name = getEventName(type);
		await eventBusService.emit({
			name,
			data,
		});

		res.status(200).send({ message: 'Received the webhook data successfully' });
	} catch (error) {
		logger.error(
			'Error occurred while processing the webhook data',
			error as Error
		);
		res
			.status(500)
			.send({ error: 'An error occurred while processing the webhook data' });
	}
};

function getEventName(type: WebhookType): EventType {
	switch (type) {
		case 'product_synced':
			return 'printful.product_synced';
		case 'product_updated':
			return 'printful.product_updated';
		case 'product_deleted':
			return 'printful.product_deleted';
		case 'package_shipped':
			return 'printful.package_shipped';
		case 'package_returned':
			return 'printful.package_returned';
		case 'order_created':
			return 'printful.order_created';
		case 'order_updated':
			return 'printful.order_updated';
		case 'order_canceled':
			return 'printful.order_canceled';
		case 'order_failed':
			return 'printful.order_failed';
		case 'order_put_hold':
			return 'printful.order_put_hold';
		case 'order_put_hold_approval':
			return 'printful.order_put_hold_approval';
		case 'order_remove_hold':
			return 'printful.order_remove_hold';
		default:
			throw new Error(`Unknown webhook type: ${type}`);
	}
}
