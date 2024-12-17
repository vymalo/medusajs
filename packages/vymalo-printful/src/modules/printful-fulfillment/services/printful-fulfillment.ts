import { AbstractFulfillmentProviderService } from '@medusajs/framework/utils';
import type { FulfillmentOption, Logger } from '@medusajs/framework/types';
import type PrintFulService from '../../printful/services/printful-service';
import type { Order } from '../../../core';

type InjectedDependencies = {
	logger: Logger;
	printful: PrintFulService;
};

type Context = {
	shipping_address: {
		address_1: string;
		city: string;
		country_code: string;
		postal_code: string;
		phone: string;
	};
	items: {
		variant: {
			metadata: {
				printful_catalog_variant_id: string;
			};
		};
		quantity: number;
	}[];
};

type PrintfulFullfillmentData = {
	printfulOrder: Order;
};

export default class PrintfulFulfillment extends AbstractFulfillmentProviderService {
	static identifier = 'printful';

	private readonly logger_: Logger;
	private readonly printfulService: PrintFulService;

	constructor({ logger, printful }: InjectedDependencies) {
		super();

		this.logger_ = logger;
		this.printfulService = printful;

		this.logger_.info('Printful fulfillment provider initialized');
	}

	public async canCalculate(data: Record<string, unknown>): Promise<boolean> {
		this.logger_.info('canCalculate');
		console.log(data);
		return data.id === 'STANDARD' || data.id === 'PRINTFUL_FAST';
	}

	public async calculatePrice(
		optionData: Record<string, unknown>,
		data: Record<string, unknown>,
		context: Context
	): Promise<number> {
		this.logger_.info('calculatePrice');
		console.log(optionData, data, context);
		try {
			const result = await this.printfulService.getShippingRates({
				recipient: {
					address1: context.shipping_address.address_1,
					city: context.shipping_address.city,
					country_code: context.shipping_address.country_code,
					zip: context.shipping_address.postal_code,
					phone: context.shipping_address.phone || null,
				},
				items: context.items.map((item) => ({
					variant_id: item.variant.metadata.printful_catalog_variant_id,
					quantity: item.quantity,
				})),
			});

			// return the rate where optionData.id is the same as the id of the result
			const shippingOption = result.find(
				(option) => option.id === optionData.id
			);
			if (shippingOption) {
				return parseInt(shippingOption.rate, 10) * 100;
			}
		} catch (e) {
			this.logger_.error(
				'Could not get shipping rates from Printful',
				e as Error
			);
			throw e;
		}

		throw new Error('Could not find shipping option');
	}

	public async validateOption(data: Record<string, unknown>): Promise<boolean> {
		this.logger_.info('validateOption');
		console.log(data);
		return true;
	}

	public async validateFulfillmentData(
		optionData: Record<string, unknown>,
		data: Record<string, unknown>,
		context: Record<string, unknown>
	): Promise<any> {
		this.logger_.info('validateFulfillmentData');
		console.log(optionData, data, context);
		return { ...data };
	}

	public async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
		return [
			{
				id: 'STANDARD', // this id should match the id of the shipping option in the Printful API
				name: 'Printful Default',
			},
			{
				id: 'PRINTFUL_FAST', // this id should match the id of the shipping option in the Printful API
				name: 'Printful Express',
			},
			{
				id: 'printful-return', // this id should match the id of the shipping option in the Printful API
				name: 'Printful Return',
				is_return: true,
			},
		];
	}

	public async cancelFulfillment(
		data: PrintfulFullfillmentData
	): Promise<void> {
		await this.printfulService.cancelOrder(data.printfulOrder.id);
	}

	public async createFulfillment(
		data: Record<string, unknown>,
		items: Record<string, unknown>[],
		order: Record<string, unknown> | undefined,
		fulfillment: Record<string, unknown>
	): Promise<{ data: PrintfulFullfillmentData }> {
		this.logger_.info(`Create a fulfillment for order ${order.id}`);
		const printfulOrder = await this.printfulService.confirmOrderById(
			`@${order.id}`
		);
		return {
			data: {
				...data,
				printfulOrder,
			},
		};
	}

	public async createReturnFulfillment(
		fulfillment: Record<string, unknown>
	): Promise<any> {
		this.logger_.info('createReturnFulfillment');
		console.log(fulfillment);
		return super.createReturnFulfillment(fulfillment);
	}
}
