export type EventType =
	| 'printful.product_synced'
	| 'printful.product_updated'
	| 'printful.product_deleted'
	| 'printful.package_shipped'
	| 'printful.package_returned'
	| 'printful.order_created'
	| 'printful.order_updated'
	| 'printful.order_canceled'
	| 'printful.order_failed'
	| 'printful.order_put_hold'
	| 'printful.order_put_hold_approval'
	| 'printful.order_remove_hold';
