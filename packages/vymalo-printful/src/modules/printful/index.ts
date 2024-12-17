import { Module } from '@medusajs/framework/utils';
import { PrintFulService } from './services';
import { ensurePrintfulWebhookSetup, ensurePrintfulTagSetup } from './loaders';
import { PrintfulModules } from '../../utils';

export default Module(PrintfulModules.printful, {
	service: PrintFulService,
	loaders: [ensurePrintfulWebhookSetup, ensurePrintfulTagSetup],
});
