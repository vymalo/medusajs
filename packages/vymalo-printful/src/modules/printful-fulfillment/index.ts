import { PrintfulFulfillment } from './services';
import { ModuleProvider, Modules } from '@medusajs/utils';

export default ModuleProvider(Modules.FULFILLMENT, {
	services: [PrintfulFulfillment],
});
