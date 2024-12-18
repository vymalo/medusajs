import type { LoaderOptions } from '@medusajs/types';
import { PrintfulOptions } from '../../../types';
import { Modules } from '@medusajs/utils';

export default async function ensurePrintfulTagSetup({
	logger,
	container,
}: LoaderOptions<PrintfulOptions>): Promise<void> {
	const productService = container.resolve(Modules.PRODUCT);
	const result = await productService.listProductTags({
		value: 'printful',
	});
	if (result.length === 0) {
		logger.info('Creating Printful tag');
		try {
			await productService.createProductTags({
				value: 'printful',
			});
		} catch (e) {
			logger.error('Could not create Printful tag', e as Error);
		}
	}

	logger.info('Printful tag is set up');
}
