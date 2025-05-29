import type { LoaderOptions } from '@medusajs/framework/types';
import { asValue } from 'awilix';
import axios, { type AxiosInstance } from 'axios';
import type { Options } from './types';

export default async function appriseLoader({
	logger,
	container,
	options,
}: LoaderOptions<Partial<Options>>): Promise<void> {
	logger?.info('Setting up Apprise service');
	let client: AxiosInstance;
	if (typeof options?.client === 'function') {
		client = await options?.client();
	} else {
		client = axios.create(options?.client);
	}

	container.register({
		axios_client: asValue(client),
	});
	logger?.info('Apprise service ready');
}
