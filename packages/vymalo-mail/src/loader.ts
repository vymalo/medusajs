import type { LoaderOptions } from '@medusajs/framework/types';
import Email from 'email-templates';
import { Options } from './types';

export default async function mailLoader({
	logger,
	container,
	options,
}: LoaderOptions<Options>): Promise<void> {
	logger.info('Setting up email service');
	const email = new Email(options);

	container.registerAdd('email', email);
	logger.info('Email service set up');
}
