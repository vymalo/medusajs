import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { WISHLIST_MODULE } from '../../modules/wishlist';
import type WishlistModuleService from '../../modules/wishlist/service';

type DeleteWishlistItemStepInput = {
	wishlist_item_id: string;
};

export const deleteWishlistItemStep = createStep(
	'delete-wishlist-item',
	async ({ wishlist_item_id }: DeleteWishlistItemStepInput, { container }) => {
		const wishlistModuleService: WishlistModuleService =
			container.resolve(WISHLIST_MODULE);

		await wishlistModuleService.softDeleteWishlistItems(wishlist_item_id);

		return new StepResponse(void 0, wishlist_item_id);
	},
	async (wishlistItemId, { container }) => {
		const wishlistModuleService: WishlistModuleService =
			container.resolve(WISHLIST_MODULE);

		await wishlistModuleService.restoreWishlistItems([wishlistItemId]);
	},
);
