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
	isString,
} from '@medusajs/framework/utils';
import argon2, { type Options } from 'argon2';

type InjectedDependencies = {
	logger: Logger;
};

type Argon2Options = {
	argon2?: Options;
};

export default class ArgoEmailPassAuthService extends AbstractAuthModuleProvider {
	public static readonly identifier = 'emailpass';
	public static readonly DISPLAY_NAME = 'Argon Email/Password Authentication';

	protected readonly config: Argon2Options;
	protected readonly logger: Logger;

	constructor({ logger }: InjectedDependencies, options: Argon2Options) {
		// @ts-ignore
		super(...arguments);
		this.config = options;
		this.logger = logger;
	}

	async update(
		data: { password: string; entity_id: string },
		authIdentityService: AuthIdentityProviderService,
	) {
		const { password, entity_id } = data ?? {};

		if (!entity_id) {
			return {
				success: false,
				error: `Cannot update ${this.identifier} provider identity without entity_id`,
			};
		}

		if (!password || !isString(password)) {
			return { success: true };
		}

		let authIdentity: AuthIdentityDTO | undefined;

		try {
			const { passwordHash } = await this.hashPassword(password);

			authIdentity = await authIdentityService.update(entity_id, {
				provider_metadata: {
					password: passwordHash,
				},
			});
		} catch (error) {
			return { success: false, error: error.message };
		}

		return {
			success: true,
			authIdentity,
		};
	}

	async authenticate(
		userData: AuthenticationInput,
		authIdentityService: AuthIdentityProviderService,
	): Promise<AuthenticationResponse> {
		const { email, password } = userData.body ?? {};

		if (!password || !isString(password)) {
			return {
				success: false,
				error: 'Password should be a string',
			};
		}

		if (!email || !isString(email)) {
			return {
				success: false,
				error: 'Email should be a string',
			};
		}

		let authIdentity: AuthIdentityDTO | undefined;

		try {
			authIdentity = await authIdentityService.retrieve({
				entity_id: email,
			});
		} catch (error) {
			if (error.type === MedusaError.Types.NOT_FOUND) {
				return {
					success: false,
					error: 'Invalid email or password',
				};
			}

			return { success: false, error: error.message };
		}

		const providerIdentity = authIdentity.provider_identities?.find(
			(pi) => pi.provider === this.identifier,
		);
		const passwordHash = providerIdentity?.provider_metadata?.password;

		if (!isString(passwordHash)) {
			return {
				success: false,
				error: 'Invalid email or password',
			};
		}

		const success = await argon2.verify(passwordHash, password);
		if (!success) {
			return {
				success: false,
				error: 'Invalid email or password',
			};
		}

		const superjson = await import('superjson');
		const copy = superjson.parse<AuthIdentityDTO>(
			superjson.stringify(authIdentity),
		);
		const providerIdentityCopy = copy.provider_identities?.find(
			(pi) => pi.provider === this.identifier,
		);
		delete providerIdentityCopy?.provider_metadata?.password;

		return {
			success,
			authIdentity: copy,
		};
	}

	async register(
		userData: AuthenticationInput,
		authIdentityService: AuthIdentityProviderService,
	): Promise<AuthenticationResponse> {
		const { email, password } = userData.body ?? {};

		if (!password || !isString(password)) {
			return {
				success: false,
				error: 'Password should be a string',
			};
		}

		if (!email || !isString(email)) {
			return {
				success: false,
				error: 'Email should be a string',
			};
		}

		try {
			await authIdentityService.retrieve({
				entity_id: email,
			});

			return {
				success: false,
				error: 'Identity with email already exists',
			};
		} catch (error) {
			if (error.type === MedusaError.Types.NOT_FOUND) {
				const createdAuthIdentity = await this.createAuthIdentity({
					email,
					password,
					authIdentityService,
				});

				return {
					success: true,
					authIdentity: createdAuthIdentity,
				};
			}

			return { success: false, error: error.message };
		}
	}

	protected async hashPassword(password: string) {
		const passwordHash = await argon2.hash(password, this.config.argon2);
		return { passwordHash };
	}

	protected async createAuthIdentity({
		email,
		password,
		authIdentityService,
	}: {
		email: string;
		password: string;
		authIdentityService: AuthIdentityProviderService;
	}) {
		const { passwordHash } = await this.hashPassword(password);

		const createdAuthIdentity = await authIdentityService.create({
			entity_id: email,
			provider_metadata: {
				password: passwordHash,
			},
		});

		const superjson = await import('superjson');

		const copy = superjson.parse<AuthIdentityDTO>(
			superjson.stringify(createdAuthIdentity),
		);
		const providerIdentityCopy = copy.provider_identities?.find(
			(pi) => pi.provider === this.identifier,
		);
		delete providerIdentityCopy?.provider_metadata?.password;

		return copy;
	}
}
