import { randomBytes } from 'node:crypto';
import { MedusaError } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { WebAuthnAuth_ID } from '../../../auth/contants';
import WebAuthnApiService from '../../../modules/webauthn-api/service';

export type GetAuthOptionsStep = {
	username: string;
};

export type GetAuthOptionsStepResponse = {
	authId: string;
	options: PublicKeyCredentialRequestOptionsJSON;
};

const getAuthOptions = createStep(
	'get-auth-options-step',
	async ({ username }: GetAuthOptionsStep, { container }) => {
		const authService = container.resolve('auth');
		const webauthnApiService: WebAuthnApiService = container.resolve(
			WebAuthnApiService.identifier,
		);

		const authId = randomBytes(32).toString();
		const authIdentities = await authService.listAuthIdentities({
			provider_identities: {
				entity_id: username,
				provider: WebAuthnAuth_ID,
			},
		});
		if (!authIdentities.length) {
			throw new MedusaError(
				MedusaError.Types.UNAUTHORIZED,
				'Either no or too much auth configured for this account',
			);
		}

		const [authIdentity] = authIdentities;

		const { options, authIdentity: newAuthIdentity } =
			await webauthnApiService.generateAuthenticationOptions(
				authId,
				authIdentity,
			);

		await authService.updateAuthIdentities(newAuthIdentity);

		return new StepResponse({
			options,
			authId,
		} satisfies GetAuthOptionsStepResponse);
	},
);

export default getAuthOptions;
