import type { LoaderOptions } from '@medusajs/framework/types';
import Email from 'email-templates';
import type { Options } from './types';
import { asValue } from 'awilix';

export default async function mailLoader({
	logger,
	container,
	options,
}: LoaderOptions<Options>): Promise<void> {
	logger.info('Setting up email service');
	const email = new Email(options);

	container.register({
		email_client: asValue(email),
	});
	logger.info('Email service set up');
}
