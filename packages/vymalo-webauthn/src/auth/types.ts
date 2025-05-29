import type { ProviderIdentityDTO } from '@medusajs/framework/types';
import type {
	AuthenticationResponseJSON,
	AuthenticatorTransportFuture,
	Base64URLString,
	CredentialDeviceType,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

export type Passkey = {
	id: Base64URLString;
	publicKey: string;
	counter: number;
	deviceType: CredentialDeviceType;
	backedUp: boolean;
	transports?: AuthenticatorTransportFuture[];
};

export type ProviderMetadata = {
	passkeys?: Record<Base64URLString, Omit<Passkey, 'id'>>;
	creationOptions?: PublicKeyCredentialCreationOptionsJSON;
	authOptions?: Record<string, PublicKeyCredentialRequestOptionsJSON>;
};

export type WebAuthnProviderIdentityDTO = Omit<
	ProviderIdentityDTO,
	'provider_metadata'
> & {
	provider_metadata?: ProviderMetadata;
};

export type AuthResponse = {
	authJSON: AuthenticationResponseJSON;
	authId: string;
};
