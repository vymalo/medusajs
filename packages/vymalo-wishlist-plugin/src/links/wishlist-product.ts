import { defineLink } from '@medusajs/framework/utils';
import ProductModule from '@medusajs/medusa/product';
import WishlistModule from '../modules/wishlist';

export default defineLink(
	{
		linkable: WishlistModule.linkable.wishlistItem.id,
		field: 'product_variant_id',
	},
	ProductModule.linkable.productVariant,
	{
		readOnly: true,
	},
);
