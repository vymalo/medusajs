import type { IPrintfulService } from './printful';
import { PrintfulModules } from '../utils';

declare module '@medusajs/types' {
	interface ModuleImplementations {
		[PrintfulModules.printful]: IPrintfulService;
	}
}
