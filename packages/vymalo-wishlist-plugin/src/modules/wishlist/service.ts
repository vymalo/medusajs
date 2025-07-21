import type { Context } from '@medusajs/framework/types';
import {
	InjectManager,
	MedusaContext,
	MedusaService,
} from '@medusajs/framework/utils';
import type { EntityManager } from '@mikro-orm/knex';
import { Wishlist } from './models/wishlist';
import { WishlistItem } from './models/wishlist-item';

export default class WishlistModuleService extends MedusaService({
	Wishlist,
	WishlistItem,
}) {
	@InjectManager()
	async getWishlistsOfVariants(
		variantIds: string[],
		@MedusaContext() context: Context<EntityManager> = {},
	): Promise<number> {
		return (
			(
				await context.manager
					?.createQueryBuilder('wishlist_item', 'wi')
					.select(['wi.wishlist_id'], true)
					.where('wi.product_variant_id IN (?)', [variantIds])
					.execute()
			)?.length || 0
		);
	}
}
