import type { LoaderOptions } from '@medusajs/types';
import { isString } from '@medusajs/utils';
import { asValue } from 'awilix';
import type { Options } from '../types';

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

	logger?.info('Setting up meilisearch service');
	const { Meilisearch } = await import('meilisearch');
	const client = new Meilisearch(options.config);

	container.register({
		meilisearch_client: asValue(client),
	});
	logger?.info('Meilisearch service set up');
}
