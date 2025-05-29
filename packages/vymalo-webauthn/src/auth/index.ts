import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import WebAuthnAuthService from './service';

export default ModuleProvider(Modules.AUTH, {
	services: [WebAuthnAuthService],
});
