import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import ArgoEmailPassAuthService from './service';

export default ModuleProvider(Modules.AUTH, {
	services: [ArgoEmailPassAuthService],
});
