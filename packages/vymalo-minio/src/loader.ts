import type { ProviderLoaderOptions } from '@medusajs/framework/types';
import type { Options } from './types';
import { Client } from 'minio';
import { MedusaError } from '@medusajs/framework/utils';
import { asValue } from 'awilix';

export default async function minioLoader({
	logger,
	container,
	options,
}: ProviderLoaderOptions<Options>): Promise<void> {
	const requiredFields: (keyof Options)[] = [
		'endpoint',
		'cdn_url',
		'bucket',
		'access_key_id',
		'secret_access_key',
		'download_url_duration',
	];
	requiredFields.forEach((field) => {
		if (!options[field]) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				`Minio file service is missing required field: ${field}`
			);
		}
	});

	logger.info('Setting up email service');
	const url = new URL(options.endpoint);
	const client = new Client({
		endPoint: url.hostname,
		port: parseInt(url.port),
		useSSL: url.protocol === 'https:',
		accessKey: options.access_key_id,
		secretKey: options.secret_access_key,
	});

	container.register({
		minio_client: asValue(client),
	});
	logger.info('Email service set up');
}
