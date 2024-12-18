import { Module } from '@medusajs/utils';
import { PrintFulService } from './services';
import { ensurePrintfulWebhookSetup, ensurePrintfulTagSetup } from './loaders';
import { PrintfulModules } from '../../utils';

export default Module(PrintfulModules.printful, {
	service: PrintFulService,
	loaders: [ensurePrintfulWebhookSetup, ensurePrintfulTagSetup],
});
