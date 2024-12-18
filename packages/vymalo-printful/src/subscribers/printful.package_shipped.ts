import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { EventType, WebhookWithData } from '../types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/utils';
import { map, filter } from 'lodash';
import { RegisterOrderShipmentDTO } from '@medusajs/types/dist/order/mutations';

type Data = Extract<
	WebhookWithData,
	{
		type: 'package_shipped';
	}
>['data'];

export default async function printfulPackage_shipped({
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
		logger.log(`Order ${order.external_id} was shipped`);
	} catch (e) {
		logger.error(`Error shipping printful order "${order?.id}":`, e as Error);
	}
}

export const config: SubscriberConfig = {
	event: 'printful.package_shipped',
} as { event: EventType };
