import type { AuthIdentityDTO } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import WebAuthnAuthService from '../../../auth/service';
import type { ProviderMetadata } from '../../../auth/types';

function shouldRemove(auth: AuthIdentityDTO) {
	if (!auth.app_metadata) {
		return true;
	}

	for (const provider of auth.provider_identities ?? []) {
		if (provider.provider === WebAuthnAuthService.identifier) {
			const meta = provider.provider_metadata as ProviderMetadata;
			const passkeys = Object.entries(meta.passkeys ?? {});
			if (!passkeys.length) {
				return true;
			}
		}
	}

	return false;
}

const removeOldNonPasskeyAuthIdentitiesStep = createStep(
	'remove-old-non-passkey-auth-Identities-step',
	async (_, { container }) => {
		const authService = container.resolve('auth');
		const authEntities = await authService.listAuthIdentities(
			{
				provider_identities: {
					provider: WebAuthnAuthService.identifier,
				},
			},
			{
				relations: ['provider_identities'],
				filters: {
					updated_at: {
						$lt: new Date(Date.now() - 1_000 * 5),
					},
				},
			},
		);

		const removablesId = authEntities.filter(shouldRemove).map(({ id }) => id);

		await authService.deleteAuthIdentities(removablesId);

		return new StepResponse(undefined);
	},
);

export default removeOldNonPasskeyAuthIdentitiesStep;
