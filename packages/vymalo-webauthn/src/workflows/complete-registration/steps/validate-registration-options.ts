import { MedusaError } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import type { Passkey } from '../../../auth/types';
import WebAuthnApiService from '../../../modules/webauthn-api/service';

export type ValidateRegistrationOptionsStepInput = {
	payload: RegistrationResponseJSON;
	authIdentityId: string;
};

const validateRegistrationOptionsStep = createStep(
	'validate-registration-options',
	async (
		{ authIdentityId, payload }: ValidateRegistrationOptionsStepInput,
		{ container },
	) => {
		const authService = container.resolve('auth');
		const webauthnApiService: WebAuthnApiService = container.resolve(
			WebAuthnApiService.identifier,
		);

		const authIdentity = await authService.retrieveAuthIdentity(
			authIdentityId,
			{
				relations: ['provider_identities'],
			},
		);

		const providerIdentity =
			webauthnApiService.getProviderIdentity(authIdentity);

		if (
			!providerIdentity?.provider_metadata?.creationOptions ||
			!providerIdentity.provider_metadata
		) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				'user not registred? How?',
			);
		}

		const { verified, registrationInfo } =
			await webauthnApiService.verifyRegistration({
				body: payload,
				options: providerIdentity.provider_metadata?.creationOptions,
			});

		if (!registrationInfo) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				'for some reason, the registrationInfo is not available. hmmm...',
			);
		}

		const { credential, credentialDeviceType, credentialBackedUp } =
			registrationInfo;

		const newPasskey: Passkey = {
			// A unique identifier for the credential
			id: credential.id,
			// The public key bytes, used for subsequent authentication signature verification
			publicKey: Buffer.from(credential.publicKey).toString('base64'),
			// The number of times the authenticator has been used on this site so far
			counter: credential.counter,
			// How the browser can talk with this credential's authenticator
			transports: credential.transports,
			// Whether the passkey is single-device or multi-device
			deviceType: credentialDeviceType,
			// Whether the passkey has been backed up in some way
			backedUp: credentialBackedUp,
		};

		providerIdentity.provider_metadata.passkeys =
			providerIdentity.provider_metadata.passkeys ?? {};
		providerIdentity.provider_metadata.passkeys[credential.id] = newPasskey;
		authService.updateProviderIdentities(providerIdentity);

		return new StepResponse(verified);
	},
);

export default validateRegistrationOptionsStep;
