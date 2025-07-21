import { defineLink } from '@medusajs/framework/utils';
import CustomerModule from '@medusajs/medusa/customer';
import WishlistModule from '../modules/wishlist';

export default defineLink(
	{
		linkable: WishlistModule.linkable.wishlist.id,
		field: 'customer_id',
	},
	CustomerModule.linkable.customer.id,
	{
		readOnly: true,
	},
);
