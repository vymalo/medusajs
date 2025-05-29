import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import { KeycloakService } from './service';

export default ModuleProvider(Modules.AUTH, {
	services: [KeycloakService],
});
