import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import appriseLoader from './loader';
import AppriseService from './service';

export default ModuleProvider(Modules.NOTIFICATION, {
	services: [AppriseService],
	loaders: [appriseLoader],
});

export * from './types';
