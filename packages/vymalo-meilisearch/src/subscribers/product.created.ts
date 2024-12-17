import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import {
	ContainerRegistrationKeys,
	Modules,
	ProductEvents,
} from '@medusajs/framework/utils';
import { ProductDTO } from '@medusajs/framework/types';
import { MeilisearchModules } from '../types';
import { SearchUtils } from '@medusajs/utils';

export default async function productCreatedMeilisearch({
	event: {
		data: { id: productId },
	},
	container,
}: SubscriberArgs<ProductDTO>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	logger.debug(
		`Product ${productId} created or updated, adding to MeiliSearch`
	);

	const productModuleService = container.resolve(Modules.PRODUCT);
	const meiliSearchService = container.resolve(MeilisearchModules.meilisearch);

	const product = await productModuleService.retrieveProduct(productId);
	if (!product) {
		logger.error(`Product ${productId} not found`);
		return;
	}

	if (product.status !== 'published') {
		logger.debug(`Product ${product.id} is not published, skipping indexing`);
		return;
	}

	await meiliSearchService.addDocuments(
		'products',
		[product],
		SearchUtils.indexTypes.PRODUCTS
	);

	logger.debug(`Product ${product.id} added to MeiliSearch`);
}

export const config: SubscriberConfig = {
	event: [ProductEvents.PRODUCT_CREATED, ProductEvents.PRODUCT_UPDATED],
};
