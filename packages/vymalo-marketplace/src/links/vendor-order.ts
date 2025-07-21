import { defineLink } from '@medusajs/framework/utils';
import OrderModule from '@medusajs/medusa/order';
import MarketplaceModule from '../modules/marketplace';

export default defineLink(MarketplaceModule.linkable.vendor, {
	linkable: OrderModule.linkable.order.id,
	isList: true,
});
