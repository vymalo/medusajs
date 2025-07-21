import { defineLink } from '@medusajs/framework/utils';
import SalesChannelModule from '@medusajs/medusa/sales-channel';
import WishlistModule from '../modules/wishlist';

export default defineLink(
	{
		linkable: WishlistModule.linkable.wishlist.id,
		field: 'sales_channel_id',
	},
	SalesChannelModule.linkable.salesChannel,
	{
		readOnly: true,
	},
);
