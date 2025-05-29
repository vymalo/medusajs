import type { AuthIdentityDTO, Logger } from '@medusajs/framework/types';
import { MedusaError, isString } from '@medusajs/framework/utils';
import type { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
	PublicKeyCredentialCreationOptionsJSON,
	RegistrationResponseJSON,
} from '@simplewebauthn/types';
import { WebAuthnAuth_ID } from '../../auth/contants';
import type {
	AuthResponse,
	WebAuthnProviderIdentityDTO,
} from '../../auth/types';

type InjectedDependencies = {
	logger: Logger;
};

type Options = {
	rpName: string;
	rpID: string;
	origin: string;
};

class WebAuthnApiService {
	public static readonly identifier = 'webauthn_api';
	public static readonly DISPLAY_NAME = 'WebAuthn API';

	protected readonly config: Options;
	protected readonly logger: Logger;

	constructor({ logger }: InjectedDependencies, options: Options) {
		this.config = WebAuthnApiService.validateOptions(options);
		this.logger = logger;
	}

	public static validateOptions(options: Options): Options {
		if (!isString(options.rpName)) {
			throw new Error('Missing required option: rpName');
		}

		if (!isString(options.rpID)) {
			throw new Error('Missing required option: rpID');
		}

		if (!isString(options.origin)) {
			throw new Error('Missing required option: origin');
		}

		return {
			rpName: options.rpName,
			rpID: options.rpID,
			origin: options.origin,
		};
	}

	public getProviderIdentity(authIdentity?: AuthIdentityDTO) {
		return authIdentity?.provider_identities?.find(
			(pi) => pi.provider === WebAuthnAuth_ID,
		) as WebAuthnProviderIdentityDTO | undefined;
	}

	public async generateRegistrationOptions(username: string) {
		const options: PublicKeyCredentialCreationOptionsJSON =
			await generateRegistrationOptions({
				rpName: this.config.rpName,
				rpID: this.config.rpID,
				userName: username,
				// Don't prompt users for additional information about the authenticator
				// (Recommended for smoother UX)
				attestationType: 'none',
				// See "Guiding use of authenticators via authenticatorSelection" below
				authenticatorSelection: {
					// Defaults
					residentKey: 'preferred',
					userVerification: 'preferred',
					// Optional
					//authenticatorAttachment: 'platform',
				},
			});

		return options;
	}

	public async generateAuthenticationOptions(
		authId: string,
		authIdentity: AuthIdentityDTO,
	) {
		const meta = this.getProviderIdentity(authIdentity)?.provider_metadata;

		if (!meta) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				'Webauthn not configured with user',
			);
		}

		const options = await generateAuthenticationOptions({
			rpID: this.config.rpID,
			// Require users to use a previously-registered authenticator
			allowCredentials: Object.entries(meta.passkeys ?? {}).map(
				([id, passkey]) => ({
					id: id,
					transports: passkey.transports,
				}),
			),
		});

		meta.authOptions = {
			...meta.authOptions,
			[authId]: options,
		};

		return { options, authIdentity };
	}

	public async verifyRegistration({
		body,
		options,
	}: {
		body: RegistrationResponseJSON;
		options: PublicKeyCredentialCreationOptionsJSON;
	}): Promise<VerifiedRegistrationResponse> {
		return await verifyRegistrationResponse({
			response: body,
			expectedChallenge: options.challenge,
			expectedOrigin: this.config.origin.split(','),
			expectedRPID: this.config.rpID,
		});
	}

	public async verifyAuthentication({
		body,
		authIdentity,
	}: {
		body: AuthResponse;
		authIdentity: AuthIdentityDTO;
	}) {
		const providerIdentity = this.getProviderIdentity(authIdentity);

		const previousOptions =
			providerIdentity?.provider_metadata?.authOptions?.[body.authId];
		if (!previousOptions) {
			return false;
		}

		const passkey =
			providerIdentity?.provider_metadata?.passkeys?.[body.authJSON.id];
		if (!passkey) {
			return false;
		}

		const { verified } = await verifyAuthenticationResponse({
			response: body.authJSON,
			expectedChallenge: previousOptions.challenge,
			expectedOrigin: this.config.origin.split(','),
			expectedRPID: this.config.rpID,
			credential: {
				id: body.authJSON.id,
				publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64')),
				counter: passkey.counter,
				transports: passkey.transports,
			},
		});

		return verified;
	}
}

export default WebAuthnApiService;
