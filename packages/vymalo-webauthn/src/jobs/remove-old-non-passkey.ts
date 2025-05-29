import type { MedusaContainer } from '@medusajs/framework/types';
import removeOldNonPasskeyAuthIdentitiesWorkflow from '../workflows/remove-old-passkey-auth-identities/index';

export default async function removeOldNonPasskeyAuthIdentities(
	container: MedusaContainer,
) {
	const logger = container.resolve('logger');
	logger.debug('Will remove all accounts withouts passkeys...');

	await removeOldNonPasskeyAuthIdentitiesWorkflow(container).run();
}

export const config = {
	name: 'remove-old-passkey-auth-identities-job',
	schedule: '*/1 * * * *', // At every minute
};
