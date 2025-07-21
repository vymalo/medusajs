import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { useQueryGraphStep } from '@medusajs/medusa/core-flows';
import { deleteWishlistItemStep } from './steps/delete-wishlist-item';
import { validateItemInWishlistStep } from './steps/validate-item-in-wishlist';
import { validateWishlistExistsStep } from './steps/validate-wishlist-exists';

type DeleteWishlistItemWorkflowInput = {
	wishlist_item_id: string;
	customer_id: string;
};

export const deleteWishlistItemWorkflow = createWorkflow(
	'delete-wishlist-item',
	(input: DeleteWishlistItemWorkflowInput) => {
		const { data: wishlists } = useQueryGraphStep({
			entity: 'wishlist',
			fields: ['*', 'items.*'],
			filters: {
				customer_id: input.customer_id,
			},
		});

		validateWishlistExistsStep({
			wishlists,
		});

		validateItemInWishlistStep({
			wishlist: wishlists[0],
			wishlist_item_id: input.wishlist_item_id,
		});

		deleteWishlistItemStep(input);

		// refetch wishlist
		const { data: updatedWishlists } = useQueryGraphStep({
			entity: 'wishlist',
			fields: ['*', 'items.*', 'items.product_variant.*'],
			filters: {
				id: wishlists[0].id,
			},
		}).config({ name: 'refetch-wishlist' });

		return new WorkflowResponse({
			wishlist: updatedWishlists[0],
		});
	},
);
