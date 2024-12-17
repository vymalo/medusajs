import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { PrintfulModules } from '../utils';

export default async function printfulProduct_updated({
	event: {},
	container,
}: SubscriberArgs<never>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const printfulService = container.resolve(PrintfulModules.printful);

	try {
		logger.log(`Printful should ync products`);
		await printfulService.syncProducts(container);
	} catch (e) {
		logger.error(`Error while syncing products:`, e as Error);
	}
}

export const config: SubscriberConfig = {
	event: 'printful.meta.sync_products',
};
