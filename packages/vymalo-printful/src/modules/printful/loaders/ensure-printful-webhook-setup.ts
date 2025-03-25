import type { LoaderOptions, Logger } from '@medusajs/types';
import { type WebhookType } from '../../../types';
import { WebhookApiService } from '../../../core';
import { Options } from './types';
import { client } from '../../../core/generated/printful/client.gen';

export default async function ensurePrintfulWebhookSetup({
	logger,
	options,
}: LoaderOptions<Options>): Promise<void> {
	client.instance.interceptors.request.use(async (config) => {
		if (options.printfulAccessToken) {
			config.headers.setAuthorization(`Bearer ${options.printfulAccessToken}`);
		}

		if (options.storeId) {
			config.headers.set('X-PF-Store-Id', options.storeId);
		}

		logger.debug(`PRINTFUL -> ${config.method} -> ${config.url}`);
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

	const {
		data: { result },
	} = await WebhookApiService.getWebhooks();

	if (
		result.url === `${backendUrl}/printful/webhook` &&
		types.every((t) => result.types.includes(t))
	) {
		logger.info('Printful webhook already set up');
		return;
	}

	const {
		data: { result: newWebhook },
	} = await WebhookApiService.createWebhook({
		body: {
			url: `${backendUrl}/printful/webhook`,
			types,
		},
	});
	logger.info(`Printful webhook set up ${newWebhook.types.join(', ')}`);
}
