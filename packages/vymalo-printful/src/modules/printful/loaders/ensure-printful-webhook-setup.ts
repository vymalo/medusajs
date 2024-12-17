import type { LoaderOptions, Logger } from '@medusajs/framework/types';
import { type WebhookType } from '../../../types';
import { OpenAPI, WebhookApiService } from '../../../core';
import { Options } from './types';

export default async function ensurePrintfulWebhookSetup({
	logger,
	options,
}: LoaderOptions<Options>): Promise<void> {
	OpenAPI.interceptors.request.use(async (config) => {
		if (options.printfulAccessToken) {
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${options.printfulAccessToken}`,
			};
		}

		if (options.storeId) {
			config.headers = {
				...config.headers,
				'X-PF-Store-Id': options.storeId,
			};
		}

		logger.info(`PRINTFUL -> ${config.method} -> ${config.url}`);
		return config;
	});

	if (!options.enableWebhooks) {
		logger.info('Printful webhooks are disabled');
	} else {
		try {
			await ensureWebhookExists(options, logger);
		} catch (e) {
			logger.error(`Failed to ensure Printful webhook setup:`, e as Error);
		}
	}
}

async function ensureWebhookExists({ backendUrl }: Options, logger: Logger) {
	const types: WebhookType[] = [
		'product_synced',
		'package_shipped',
		'package_returned',
		'order_created',
		'order_updated',
		'order_failed',
		'order_canceled',
		'product_updated',
		'product_deleted',
		'order_put_hold',
		'order_put_hold_approval',
		'order_remove_hold',
	];

	const { result } = await WebhookApiService.getWebhooks();

	if (
		result.url === `${backendUrl}/printful/webhook` &&
		types.every((t) => result.types.includes(t))
	) {
		logger.info('Printful webhook already set up');
		return;
	}

	const { result: newWebhook } = await WebhookApiService.createWebhook({
		requestBody: {
			url: `${backendUrl}/printful/webhook`,
			types,
		},
	});
	logger.info(`Printful webhook set up ${newWebhook.types.join(', ')}`);
}
