import {
	ApprovalSheetWebhookFile,
	Order,
	Shipment,
	SyncProduct,
	SyncProductDeleted,
	Webhook,
} from '../core';

export type WebhookWithData = Webhook &
	(
		| {
				type: 'product_synced';
				data: {
					sync_product: SyncProduct;
				};
		  }
		| {
				type: 'product_updated';
				data: {
					sync_product: SyncProduct;
				};
		  }
		| {
				type: 'product_deleted';
				data: {
					sync_product: SyncProductDeleted;
				};
		  }
		| {
				type: 'package_shipped';
				data: {
					shipment: Shipment;
					order: Order;
				};
		  }
		| {
				type: 'package_returned';
				data: {
					reason: string;
					shipment: Shipment;
					order: Order;
				};
		  }
		| {
				type: 'order_created';
				data: {
					order: Order;
				};
		  }
		| {
				type: 'order_updated';
				data: {
					order: Order;
				};
		  }
		| {
				type: 'order_put_hold';
				data: {
					reason: string;
					order: Order;
				};
		  }
		| {
				type: 'order_put_hold_approval';
				data: {
					reason: string;
					approval_files: ApprovalSheetWebhookFile[];
					order: Order;
				};
		  }
		| {
				type: 'order_remove_hold';
				data: {
					reason: string;
					order: Order;
				};
		  }
		| {
				type: 'order_canceled';
				data: {
					reason: string;
					order: Order;
				};
		  }
		| {
				type: 'order_failed';
				data: {
					reason: string;
					order: Order;
				};
		  }
	);

export type WebhookType = WebhookWithData['type'];
