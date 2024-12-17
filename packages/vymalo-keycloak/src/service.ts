import {
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
import { AuthorizationCode } from 'simple-oauth2';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthIdentityDTO } from '@medusajs/types/dist/auth/common';

type InjectedDependencies = {
	logger: Logger;
};

export type KeycloakOptions = {
	url: string;
	realm: string;
	clientId: string;
	clientSecret: string;
	redirect_uri: string;
};

export default class KeycloakService extends AbstractAuthModuleProvider {
	static identifier = 'vymalo-keycloak';
	static DISPLAY_NAME = 'Keycloak Authentication';
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

	async register(
		data: AuthenticationInput,
		authIdentityProviderService: AuthIdentityProviderService
	): Promise<AuthenticationResponse> {
		throw new MedusaError(
			MedusaError.Types.NOT_ALLOWED,
			'Keycloak does not support direct registration. Use method `authenticate` instead.'
		);
	}

	public async authenticate(
		{
			query: { redirect_uri, error, error_description, error_uri } = {},
		}: AuthenticationInput,
		authIdentityProviderService: AuthIdentityProviderService
	): Promise<AuthenticationResponse> {
		if (error) {
			return {
				success: false,
				error: `${error_description}, read more at: ${error_uri}`,
			};
		}

		const { response } = await this.getRedirect(redirect_uri);

		return response;
	}

	public async validateCallback(
		req: AuthenticationInput,
		authIdentityService: AuthIdentityProviderService
	): Promise<AuthenticationResponse> {
		const { code, state, error, scope } = req.query;

		if (!code || !state || !scope) {
			return {
				success: false,
				error: 'Missing required query parameters: code or state',
			};
		}

		if (error) {
			return {
				success: false,
				error: `${req.query.error_description}, read more at: ${req.query.error_uri}`,
			};
		}

		const client = this.getClient(this.options);

		const { token: keycloakTokenObject } = await client.getToken({
			redirect_uri: this.options.redirect_uri,
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

		const found: AuthIdentityDTO | MedusaError = await authIdentityService
			.retrieve({ entity_id })
			.catch((error) => {
				if (error.type === MedusaError.Types.NOT_FOUND) {
					return null;
				}
				throw error;
			});

		if ('id' in found) {
			return {
				success: true,
				authIdentity: found,
			};
		}

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

		return {
			success: false,
			error: found.message,
		};
	}

	private async getRedirect(redirect_uri: string) {
		const client = this.getClient(this.options);

		const state = Math.random().toString(36).substring(7);
		const scope = 'openid email profile';

		const authorizationUri = client.authorizeURL({
			redirect_uri: redirect_uri ?? this.options.redirect_uri,
			scope,
			state,
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
		return new AuthorizationCode({
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
