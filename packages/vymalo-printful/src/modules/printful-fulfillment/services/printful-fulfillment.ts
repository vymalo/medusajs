import { AbstractFulfillmentProviderService } from '@medusajs/utils';
import {
	CalculatedShippingOptionPrice,
	CalculateShippingOptionPriceDTO,
	CreateFulfillmentResult,
	CreateShippingOptionDTO,
	FulfillmentDTO,
	FulfillmentItemDTO,
	FulfillmentOption,
	FulfillmentOrderDTO,
	IProductModuleService,
	Logger,
} from '@medusajs/types';
import type { ItemInfo, Order } from '../../../core';
import { PrintfulModules } from '../../../utils';
import type { IPrintfulService } from '../../../types';

type InjectedDependencies = {
	logger: Logger;
	[PrintfulModules.printful]: IPrintfulService;
};

type PrintfulFullfillmentData = {
	printfulOrder: Order;
};

export default class PrintfulFulfillment extends AbstractFulfillmentProviderService {
	static identifier = 'printful';

	private readonly logger_: Logger;
	private readonly printfulService: IPrintfulService;
	private readonly productModuleService: IProductModuleService;

	constructor({ logger, printful }: InjectedDependencies) {
		// @ts-ignore
		super(...arguments);

		this.logger_ = logger;
		this.printfulService = printful;

		this.logger_.info('Printful fulfillment provider initialized');
	}

	public async canCalculate({
		data,
	}: CreateShippingOptionDTO): Promise<boolean> {
		this.logger_.info('canCalculate');
		console.debug(data);
		return data.id === 'STANDARD' || data.id === 'PRINTFUL_FAST';
	}

	public async calculatePrice(
		optionData: CalculateShippingOptionPriceDTO['optionData'],
		data: CalculateShippingOptionPriceDTO['data'],
		context: CalculateShippingOptionPriceDTO['context']
	): Promise<CalculatedShippingOptionPrice> {
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
				items: context.items.map(
					(item) =>
						({
							variant_id: item.variant_id,
							quantity: item.quantity,
						}) as ItemInfo
				),
			});

			// return the rate where optionData.id is the same as the id of the result
			const shippingOption = result.find(
				(option) => option.id === optionData.id
			);
			if (shippingOption) {
				return {
					calculated_amount: parseInt(shippingOption.rate, 10) * 100,
					is_calculated_price_tax_inclusive: false,
				};
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
		items: Partial<Omit<FulfillmentItemDTO, 'fulfillment'>>[],
		order: Partial<FulfillmentOrderDTO> | undefined,
		_fulfillment: Partial<
			Omit<FulfillmentDTO, 'provider_id' | 'data' | 'items'>
		>
	): Promise<CreateFulfillmentResult> {
		this.logger_.info(`Create a fulfillment for order ${order.id}`);
		const printfulOrder = await this.printfulService.confirmOrderById(
			`@${order.id}`
		);
		return {
			data: {
				...data,
				printfulOrder,
			},
			labels: printfulOrder.shipments.map((d) => ({
				tracking_url: d.tracking_url,
				tracking_number: d.tracking_number,
				label_url: d.carrier,
			})),
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
