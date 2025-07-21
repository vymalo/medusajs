import type { InferTypeOf } from '@medusajs/framework/types';
import { MedusaError } from '@medusajs/framework/utils';
import { createStep } from '@medusajs/framework/workflows-sdk';
import type { Wishlist } from '../../modules/wishlist/models/wishlist';

type ValidateItemInWishlistStepInput = {
	wishlist: InferTypeOf<typeof Wishlist>;
	wishlist_item_id: string;
};

export const validateItemInWishlistStep = createStep(
	'validate-item-in-wishlist',
	async (
		{ wishlist, wishlist_item_id }: ValidateItemInWishlistStepInput,
		{ container },
	) => {
		const item = wishlist.items.find((item) => item.id === wishlist_item_id);

		if (!item) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				"Item does not exist in customer's wishlist",
			);
		}
	},
);
