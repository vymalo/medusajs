import { MedusaError } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import WebAuthnApiService from '../../../modules/webauthn-api/service';

export type StartRegistrationOptionsStepInput = {
	authIdentityId: string;
};

const validateRegistrationOptionsStep = createStep(
	'start-registration-options',
	async (
		{ authIdentityId }: StartRegistrationOptionsStepInput,
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
		if (!providerIdentity?.entity_id || !providerIdentity.provider_metadata) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				'user not registred? How?',
			);
		}

		const options = await webauthnApiService.generateRegistrationOptions(
			providerIdentity?.entity_id,
		);

		providerIdentity.provider_metadata.creationOptions = options;
		authService.updateProviderIdentities(providerIdentity);
		return new StepResponse(options);
	},
);

export default validateRegistrationOptionsStep;
