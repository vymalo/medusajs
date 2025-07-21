import type {
	AuthenticationInput,
	AuthenticationResponse,
	AuthIdentityProviderService,
	Logger,
} from '@medusajs/framework/types';
import {
	AbstractAuthModuleProvider,
	isString,
	MedusaError,
} from '@medusajs/framework/utils';
import type { AuthIdentityDTO } from '@medusajs/types/dist/auth/common';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { AuthorizationCode } from 'simple-oauth2';

type InjectedDependencies = {
	logger: Logger;
};

export type KeycloakOptions = {
	url: string;
	realm: string;
	clientId: string;
	clientSecret: string;
	default_redirect_uri: string;
	scope?: string;
};

export class KeycloakService extends AbstractAuthModuleProvider {
	public static identifier = 'vymalo-keycloak';
	public static DISPLAY_NAME = 'Keycloak Authentication';
	protected options: KeycloakOptions;
	protected logger_: Logger;

	constructor({ logger }: InjectedDependencies, options: KeycloakOptions) {
		// @ts-ignore
		super(...arguments);

		this.logger_ = logger;
		this.options = options;
	}

	static validateOptions(options: KeycloakOptions) {
		if (!isString(options.url)) {
			throw new Error('Missing required option: url');
		}

		if (!isString(options.realm)) {
			throw new Error('Missing required option: realm');
		}

		if (!isString(options.clientId)) {
			throw new Error('Missing required option: clientId');
		}

		if (!isString(options.clientSecret)) {
			throw new Error('Missing required option: clientSecret');
		}
	}

	async register(): Promise<AuthenticationResponse> {
		throw new MedusaError(
			MedusaError.Types.NOT_ALLOWED,
			'Keycloak does not support direct registration. Use method `authenticate` instead.'
		);
	}

	public async authenticate({
		query: { redirect_uri, error, error_description, error_uri } = {},
		body: { kc_idp_hint } = {}
	}: AuthenticationInput): Promise<AuthenticationResponse> {
		if (error) {
			return {
				success: false,
				error: `${error_description}, read more at: ${error_uri}`,
			};
		}

		const { response } = await this.getRedirect(redirect_uri, kc_idp_hint);

		return response;
	}

	public async validateCallback(
		req: AuthenticationInput,
		authIdentityService: AuthIdentityProviderService
	): Promise<AuthenticationResponse> {
		const { code, state, error, scope, error_description, error_uri } =
			req.query ?? {};

		if (!code || !state || !scope) {
			return {
				success: false,
				error: 'Missing required query parameters: code or state',
			};
		}

		if (error) {
			return {
				success: false,
				error: `${error_description}, read more at: ${error_uri}`,
			};
		}

		const client = this.getClient(this.options);

		const { token: keycloakTokenObject } = await client.getToken({
			redirect_uri: this.options.default_redirect_uri,
			code,
			scope,
		});

		const { access_token } = keycloakTokenObject;

		const jwtData = jwt.decode(access_token as string, {
			complete: true,
		}) as JwtPayload;

		const entity_id = jwtData.email as string;
		if (!entity_id) {
			return {
				success: false,
				error: 'Missing required data in JWT token: email',
			};
		}

		const found: AuthIdentityDTO | MedusaError | null =
			await authIdentityService
				.retrieve({ entity_id })
				.catch((error: MedusaError) => {
					if (error.type === MedusaError.Types.NOT_FOUND) {
						return null;
					}

					return error;
				});

		if (!found) {
			const created = await authIdentityService.create({
				entity_id,
				user_metadata: {
					email: jwtData.email,
					name: jwtData.name,
					picture: jwtData.picture,
					given_name: jwtData.given_name,
					family_name: jwtData.family_name,
				},
			});

			return {
				success: true,
				authIdentity: created,
			};
		}

		if ('id' in found) {
			return {
				success: true,
				authIdentity: found,
			};
		}

		return {
			success: false,
			error: found.message,
		};
	}

	private async getRedirect(
		redirect_uri: string | undefined,
		kc_idp_hint?: string
	) {
		const client = this.getClient(this.options);

		const state = Math.random().toString(36).substring(7);
		const scope = this.options.scope ?? 'openid email profile';

		const authorizationUri = client.authorizeURL({
			redirect_uri: redirect_uri ?? this.options.default_redirect_uri,
			scope,
			state,
			kc_idp_hint,
		});

		const response: AuthenticationResponse = {
			success: true,
			location: authorizationUri,
		};

		return { response, state, scope };
	}

	private getClient({
		clientId,
		url: kcUrl,
		clientSecret,
		realm,
	}: KeycloakOptions) {
		const url = new URL(kcUrl);
		return new AuthorizationCode<'kc_idp_hint' | 'client_id'>({
			client: {
				id: clientId,
				secret: clientSecret,
			},
			auth: {
				tokenHost: url.origin,
				tokenPath: `/realms/${realm}/protocol/openid-connect/token`,
				revokePath: `/realms/${realm}/protocol/openid-connect/logout`,
				authorizePath: `/realms/${realm}/protocol/openid-connect/auth`,
			},
		});
	}
}
