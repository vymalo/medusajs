import type { LoaderOptions } from '@medusajs/types';
import type { Options } from 'app-options';
import { isString } from '@medusajs/utils';
import { asValue } from 'awilix';

export default async function meilisearchLoader({
	logger,
	container,
	options,
}: LoaderOptions<Options>): Promise<void> {
	if (!isString(options?.config?.host)) {
		throw new Error('Missing required option: "options.config.host"');
	}

	if (!isString(options?.config?.apiKey)) {
		throw new Error('Missing required option: "options.config.apiKey"');
	}

	logger.info('Setting up meilisearch service');
	const { Meilisearch } = await import('meilisearch');
	const client = new Meilisearch(options.config);

	container.register({
		client: asValue(client),
	});
	logger.info('Meilisearch service set up');
}
