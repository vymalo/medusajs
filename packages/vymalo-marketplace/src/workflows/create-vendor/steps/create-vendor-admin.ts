import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { MARKETPLACE_MODULE } from '../../../modules/marketplace';
import type MarketplaceModuleService from '../../../modules/marketplace/service';

type CreateVendorAdminStepInput = {
	email: string;
	first_name?: string;
	last_name?: string;
	vendor_id: string;
};

const createVendorAdminStep = createStep(
	'create-vendor-admin-step',
	async (adminData: CreateVendorAdminStepInput, { container }) => {
		const marketplaceModuleService: MarketplaceModuleService =
			container.resolve(MARKETPLACE_MODULE);

		const vendorAdmin =
			await marketplaceModuleService.createVendorAdmins(adminData);

		return new StepResponse(vendorAdmin, vendorAdmin.id);
	},
	async (vendorAdminId, { container }) => {
		if (!vendorAdminId) {
			return;
		}

		const marketplaceModuleService: MarketplaceModuleService =
			container.resolve(MARKETPLACE_MODULE);

		marketplaceModuleService.deleteVendorAdmins(vendorAdminId);
	},
);

export default createVendorAdminStep;
