import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { EventType, WebhookWithData } from '../types';
import { ContainerRegistrationKeys } from '@medusajs/utils';
import { PrintfulModules } from '../utils';

type Data = Extract<
	WebhookWithData,
	{
		type: 'product_deleted';
	}
>['data'];

export default async function printfulProduct_deleted({
	event: {
		data: { sync_product },
	},
	container,
}: SubscriberArgs<Data>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const productSyncService = container.resolve(PrintfulModules.printful);

	try {
		const productId = sync_product.id;
		logger.log(`Printful product ${productId} was deleted`);

		await productSyncService.deleteProduct(productId, container);
	} catch (e) {
		logger.error(
			`Error deleting printful product "${sync_product?.id}":`,
			e as Error
		);
	}
}

export const config: SubscriberConfig = {
	event: 'printful.product_deleted',
} as { event: EventType };
