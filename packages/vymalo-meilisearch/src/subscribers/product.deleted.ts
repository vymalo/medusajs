import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { ProductDTO } from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	ProductEvents,
} from '@medusajs/framework/utils';
import { MeilisearchModules } from '../types';

export default async function productDeletedMeilisearch({
	event: {
		data: { id: productId },
	},
	container,
}: SubscriberArgs<ProductDTO>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	logger.debug(`Product ${productId} deleted, removing from MeiliSearch`);

	const meiliSearchService = container.resolve(MeilisearchModules.meilisearch);
	await meiliSearchService.deleteDocument('products', productId);

	logger.debug(`Product ${productId} removed to MeiliSearch`);
}

export const config: SubscriberConfig = {
	event: ProductEvents.PRODUCT_DELETED,
};
