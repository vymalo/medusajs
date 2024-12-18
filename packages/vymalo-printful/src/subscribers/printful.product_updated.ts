import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { EventType, WebhookWithData } from '../types';
import { ContainerRegistrationKeys } from '@medusajs/utils';
import { PrintfulModules } from '../utils';

type Data = Extract<
	WebhookWithData,
	{
		type: 'product_updated';
	}
>['data'];

export default async function printfulProduct_updated({
	event: {
		data: { sync_product },
	},
	container,
}: SubscriberArgs<Data>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const printfulService = container.resolve(PrintfulModules.printful);

	try {
		logger.log(`Printful product ${sync_product.id} was updated`);
		await printfulService.createOrUpdateProduct(sync_product.id, container);
		logger.log(`Printful product ${sync_product.id} updated successfully`);
	} catch (e) {
		logger.error(
			`Error updating printful product "${sync_product.id}":`,
			e as Error
		);
	}
}

export const config: SubscriberConfig = {
	event: 'printful.product_updated',
} as { event: EventType };
