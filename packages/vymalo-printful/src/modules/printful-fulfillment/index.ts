import { PrintfulFulfillment } from './services';
import { ModuleProvider, Modules } from '@medusajs/framework/utils';

export default ModuleProvider(Modules.FULFILLMENT, {
	services: [PrintfulFulfillment],
});
