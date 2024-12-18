import { CalculateShippingRatesData, Order, ShippingInfo } from '../core';
import type { OrderDTO } from '@medusajs/types';
import type { MedusaContainer } from '@medusajs/types';

export interface IPrintfulService {
	createOrder(order: OrderDTO, container: MedusaContainer): Promise<Order>;

	confirmOrderById(orderId: string | number): Promise<Order>;

	getShippingRates(
		data: CalculateShippingRatesData['requestBody'],
	): Promise<ShippingInfo[]>;

	cancelOrder(
		orderId: string | number,
		container?: MedusaContainer
	): Promise<Order>;

	deleteProduct(
		productOrProductId: number,
		container: MedusaContainer
	): Promise<void>;

	createOrUpdateProduct(
		productId: number,
		container: MedusaContainer
	): Promise<void>;

	syncProducts(container: MedusaContainer): Promise<void>;
}
