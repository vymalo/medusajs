import type {
	AuthIdentityDTO,
	AuthIdentityProviderService,
	AuthenticationInput,
	AuthenticationResponse,
	Logger,
} from '@medusajs/framework/types';
import {
	AbstractAuthModuleProvider,
	MedusaError,
	isObject,
	isString,
} from '@medusajs/framework/utils';
import { z } from 'zod';
import WebAuthnApiService from '../modules/webauthn-api/service';
import { WebAuthnAuth_ID } from './contants';
import type {
	AuthResponse,
	ProviderMetadata,
	WebAuthnProviderIdentityDTO,
} from './types';

const PassKeyZod = z.strictObject({
	id: z.string().refine((val) => /^[A-Za-z0-9-_]+$/.test(val), {
		message: 'Invalid Base64URLString format',
	}),
	publicKey: z.instanceof(Uint8Array),
	webauthnUserID: z.string().refine((val) => /^[A-Za-z0-9-_]+$/.test(val), {
		message: 'Invalid Base64URLString format',
	}),
	counter: z.number(),
	deviceType: z.enum(['platform', 'cross-platform']),
	backedUp: z.boolean(),
	transports: z
		.array(
			z.enum([
				'ble',
				'cable',
				'hybrid',
				'internal',
				'nfc',
				'smart-card',
				'usb',
			]),
		)
		.optional(),
});

type InjectedDependencies = {
	logger: Logger;
	[WebAuthnApiService.identifier]: WebAuthnApiService;
};

class WebAuthnAuthService extends AbstractAuthModuleProvider {
	public static readonly identifier = WebAuthnAuth_ID;
	public static readonly DISPLAY_NAME = 'WebAuthn Authentication';

	protected readonly logger: Logger;
	protected readonly api: WebAuthnApiService;

	constructor({
		logger,
		[WebAuthnApiService.identifier]: api,
	}: InjectedDependencies) {
		// @ts-ignore
		super(...arguments);
		this.logger = logger;
		this.api = api;
	}

	async update(
		data: {
			passkeys: Required<ProviderMetadata>['passkeys'];
			entity_id: string;
		},
		authIdentityService: AuthIdentityProviderService,
	) {
		const { passkeys, entity_id } = data;

		if (!entity_id) {
			return {
				success: false,
				error: `Cannot update ${this.identifier} provider identity without entity_id`,
			};
		}

		if (!passkeys || !PassKeyZod.parse(passkeys)) {
			return { success: true };
		}

		const authIdentity = await authIdentityService.update(entity_id, {
			provider_metadata: {
				passkeys,
			} satisfies ProviderMetadata,
		});

		return {
			success: true,
			authIdentity,
		};
	}

	protected async createAuthIdentity({
		username,
		authIdentityService,
	}: {
		username: string;
		authIdentityService: AuthIdentityProviderService;
	}) {
		const createdAuthIdentity = await authIdentityService.create({
			entity_id: username,
			provider_metadata: {
				creationOptions: undefined,
				passkeys: {},
				authOptions: {},
			} satisfies ProviderMetadata,
		});

		return createdAuthIdentity;
	}

	async authenticate(
		userData: AuthenticationInput,
		authIdentityService: AuthIdentityProviderService,
	): Promise<AuthenticationResponse> {
		const { authId, authJSON, username } = (userData.body ??
			{}) as unknown as AuthResponse & { username: string };

		if (!authId || !isString(authId)) {
			return {
				success: false,
				error: 'Wrong auth process',
			};
		}

		if (!authJSON || !isObject(authJSON)) {
			return {
				success: false,
				error: 'Auth should be a string',
			};
		}

		if (!username || !isString(username)) {
			return {
				success: false,
				error: 'Username should be a string',
			};
		}

		let authIdentity: AuthIdentityDTO | undefined;

		try {
			authIdentity = await authIdentityService.retrieve({
				entity_id: username,
			});
		} catch (error) {
			if (error.type === MedusaError.Types.NOT_FOUND) {
				return {
					success: false,
					error: 'Invalid username',
				};
			}

			return { success: false, error: error.message };
		}

		const providerIdentity = authIdentity?.provider_identities?.find(
			(pi) => pi.provider === this.identifier,
		) as WebAuthnProviderIdentityDTO;
		const options = providerIdentity?.provider_metadata?.passkeys;

		if (!isObject(options)) {
			return {
				success: false,
				error: 'Invalid options',
			};
		}

		const success = await this.api.verifyAuthentication({
			authIdentity,
			body: { authId, authJSON },
		});
		if (!success) {
			return {
				success: false,
				error: 'Invalid credentials',
			};
		}

		const copy = await this.cleanCopy(authIdentity);

		return {
			success,
			authIdentity: copy,
		};
	}

	async register(
		userData: AuthenticationInput,
		authIdentityService: AuthIdentityProviderService,
	): Promise<AuthenticationResponse> {
		const { username } = userData.body ?? {};

		if (!username || !isString(username)) {
			return {
				success: false,
				error: 'Username should be a string',
			};
		}

		try {
			await authIdentityService.retrieve({
				entity_id: username,
			});

			return {
				success: false,
				error: 'Identity with username already exists',
			};
		} catch (error) {
			if (error.type === MedusaError.Types.NOT_FOUND) {
				const createdAuthIdentity = await this.createAuthIdentity({
					authIdentityService,
					username,
				});

				const copy = await this.cleanCopy(createdAuthIdentity);

				return {
					success: true,
					authIdentity: copy,
				};
			}

			return { success: false, error: error.message };
		}
	}

	protected async cleanCopy(authIdentity: AuthIdentityDTO) {
		const superjson = await import('superjson');
		const copy = superjson.parse(
			superjson.stringify(authIdentity),
		) as AuthIdentityDTO;
		const providerIdentityCopy = copy.provider_identities?.find(
			(pi) => pi.provider === this.identifier,
		);

		delete (
			providerIdentityCopy?.provider_metadata as ProviderMetadata | undefined
		)?.authOptions;
		delete (
			providerIdentityCopy?.provider_metadata as ProviderMetadata | undefined
		)?.creationOptions;
		delete (
			providerIdentityCopy?.provider_metadata as ProviderMetadata | undefined
		)?.passkeys;

		return copy;
	}
}

export default WebAuthnAuthService;
