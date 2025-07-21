import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { DeleteVendorAdminWorkflow } from '..';
import { MARKETPLACE_MODULE } from '../../../modules/marketplace';
import type MarketplaceModuleService from '../../../modules/marketplace/service';

const deleteVendorAdminStep = createStep(
	'delete-vendor-admin-step',
	async ({ id }: DeleteVendorAdminWorkflow, { container }) => {
		const marketplaceModuleService: MarketplaceModuleService =
			container.resolve(MARKETPLACE_MODULE);

		const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(id);

		await marketplaceModuleService.deleteVendorAdmins(id);

		return new StepResponse(undefined, vendorAdmin);
	},
	async (vendorAdmin, { container }) => {
		const marketplaceModuleService: MarketplaceModuleService =
			container.resolve(MARKETPLACE_MODULE);

		const { vendor: _, ...vendorAdminData } = vendorAdmin ?? {};

		marketplaceModuleService.createVendorAdmins(vendorAdminData);
	},
);

export default deleteVendorAdminStep;
