import type { Logger } from '@medusajs/framework/types';
import { MedusaService } from '@medusajs/framework/utils';
import Vendor from './models/vendor';
import VendorAdmin from './models/vendor-admin';

type InjectedDependencies = {
	logger: Logger;
};

class MarketplaceModuleService extends MedusaService({
	Vendor,
	VendorAdmin,
}) {
	public static readonly identifier = 'vendor';
	protected readonly logger: Logger;

	public constructor({ logger }: InjectedDependencies) {
		// @ts-ignore
		super(...arguments);

		this.logger = logger;
	}
}

export default MarketplaceModuleService;
