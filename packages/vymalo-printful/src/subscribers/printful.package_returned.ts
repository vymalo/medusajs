import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { EventType, WebhookWithData } from '../types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/utils';
import { filter, map } from 'lodash';
import type { RegisterOrderShipmentDTO } from '@medusajs/types/dist/order/mutations';

type Data = Extract<
	WebhookWithData,
	{
		type: 'package_returned';
	}
>['data'];

export default async function printfulPackage_returned({
	event: {
		data: { order, shipment },
	},
	container,
}: SubscriberArgs<Data>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const orderService = container.resolve(Modules.ORDER);

	try {
		const ids = map(shipment.items, ({ item_id }) => item_id);
		const itemsFiltered = filter(order.items, ({ id }) => ids.includes(id));
		const items: RegisterOrderShipmentDTO['items'] = map(
			itemsFiltered,
			({ external_id, quantity }) => ({
				id: external_id,
				quantity,
			})
		);

		await orderService.registerShipment({
			order_id: order.external_id,
			items: items,
			metadata: {
				provider: 'printful',
				data: shipment,
			},
		});
		logger.log(`Order ${order.external_id} was return`);
	} catch (e) {
		logger.error(`Error shipping printful order "${order?.id}":`, e as Error);
	}
}

export const config: SubscriberConfig = {
	event: 'printful.package_returned',
} as { event: EventType };
