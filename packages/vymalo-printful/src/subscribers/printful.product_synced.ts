import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { EventType, WebhookWithData } from '../types';
import { ContainerRegistrationKeys } from '@medusajs/utils';
import { PrintfulModules } from '../utils';

type Data = Extract<
	WebhookWithData,
	{
		type: 'product_synced';
	}
>['data'];

export default async function printfulProduct_synced({
	event: {
		data: { sync_product },
	},
	container,
}: SubscriberArgs<Data>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const printfulService = container.resolve(PrintfulModules.printful);

	try {
		logger.log(`Printful product ${sync_product.id} was synced`);
		await printfulService.createOrUpdateProduct(sync_product.id, container);
		logger.log(`Printful product ${sync_product.id} updated successfully`);
	} catch (e) {
		logger.error(
			`Error creating a printful product "${sync_product.id}":`,
			e as Error
		);
	}
}

export const config: SubscriberConfig = {
	event: 'printful.product_synced',
} as { event: EventType };
