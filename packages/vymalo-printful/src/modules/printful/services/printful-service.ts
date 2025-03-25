import { Modules } from '@medusajs/utils';
import type { IPrintfulService, PrintfulOptions } from '../../../types';
import {
	CalculateShippingRatesData,
	Order,
	OrdersApiService,
	PackingSlip,
	ProductsApiService,
	ShippingRateApiService,
	SyncProduct,
	SyncVariant,
} from '../../../core';
import type {
	CreateProductOptionDTO,
	CreateProductVariantWorkflowInputDTO,
	CreateProductWorkflowInputDTO,
	IFulfillmentModuleService,
	IProductModuleService,
	Logger,
	MedusaContainer,
	OrderDTO,
	ProductDTO,
	UpsertProductImageDTO,
} from '@medusajs/types';
import { groupBy, kebabCase, map, merge, uniq } from 'lodash';
import { multiMap } from '../../../utils';
import {
	createProductsWorkflow,
	deleteProductOptionsWorkflow,
	deleteProductsWorkflow,
	deleteProductVariantsWorkflow,
	updateProductsWorkflow,
} from '@medusajs/core-flows';

type InjectedDependencies = {
	logger: Logger;
	[Modules.PRODUCT]: IProductModuleService;
	[Modules.FULFILLMENT]: IFulfillmentModuleService;
};

const ColorKey = 'Color'.toLowerCase();
const SizeKey = 'Size'.toLowerCase();

type Options = Pick<PrintfulOptions, 'confirmOrder' | 'logo_url'>;

export default class PrintFulService implements IPrintfulService {
	protected readonly logger_: Logger;
	protected readonly fulfillmentService: IFulfillmentModuleService;
	protected readonly productModuleService: IProductModuleService;

	private readonly options: Options;

	constructor(
		{ logger, fulfillment, product }: InjectedDependencies,
		options: Options
	) {
		this.logger_ = logger;
		this.productModuleService = product;
		this.fulfillmentService = fulfillment;
		this.options = options;
	}

	protected get confirmOrder() {
		return this.options.confirmOrder;
	}

	public async getShippingRates(data: CalculateShippingRatesData['body']) {
		try {
			const {
				data: { result },
			} = await ShippingRateApiService.calculateShippingRates({
				body: data,
			});
			return result;
		} catch (e) {
			this.logger_.error(
				'Could not get shipping rates from Printful',
				e as Error
			);
			return null;
		}
	}

	public async createOrder(order: OrderDTO) {
		const {
			data: { id: printfulShippingId },
		} = await this.fulfillmentService.retrieveShippingOption(
			order.shipping_methods[0].shipping_option_id
		);

		const { shipping_address, email, items } = order;

		const orderObj: Order = {
			external_id: order.id,
			shipping: printfulShippingId as string,
			recipient: {
				name: shipping_address.first_name + ' ' + shipping_address.last_name,
				address1: shipping_address.address_1,
				address2: shipping_address.address_2 ?? '',
				city: shipping_address.city,
				state_code: shipping_address.province,
				country_code: shipping_address.country_code,
				zip: shipping_address.postal_code,
				email,
				phone: shipping_address.phone ?? '',
			},
			items: items.map((item) => {
				return {
					name: item.title,
					external_id: item.variant_id,
					variant_id: item.metadata.printful_catalog_variant_id as number,
					sync_variant_id: item.metadata.printful_id as number,
					quantity: item.quantity,
					price: `${(item.unit_price / 100).toFixed(2)}`.replace('.', '.'),
					retail_price: `${(item.unit_price / 100).toFixed(2)}`.replace(
						'.',
						'.'
					),
				};
			}),
			packing_slip: merge(
				{},
				{
					message: order.email,
					logo_url: this.options.logo_url,
				},
				await this.getPackingSlip(order)
			),
		};

		const {
			data: { result },
		} = await OrdersApiService.createOrder({
			query: {
				confirm: false,
				update_existing: true,
			},
			body: orderObj,
		});

		this.logger_.info(`Order created with Printful: ${result.id}`);
		return result;
	}

	public async confirmOrderById(orderId: string | number) {
		if (!this.confirmOrder) {
			this.logger_.info('Order confirmation is disabled');
			const {
				data: { result },
			} = await OrdersApiService.getOrderById({
				path: {
					id: orderId,
				},
			});
			return result;
		}

		this.logger_.info(`Confirming order with Printful: ${orderId}`);
		const {
			data: { result },
		} = await OrdersApiService.confirmOrderById({
			path: {
				id: orderId,
			},
		});

		return result;
	}

	async cancelOrder(orderId: string | number) {
		const {
			data: { result },
		} = await OrdersApiService.cancelOrderById({
			path: {
				id: orderId,
			},
		});

		return result;
	}

	public async deleteMedusaProduct(
		productOrProductId: string,
		container: MedusaContainer
	) {
		try {
			await deleteProductsWorkflow(container).run({
				input: {
					ids: [productOrProductId],
				},
			});
		} catch (e) {
			this.logger_.error('Could not delete product in Medusa', e as Error);
		}
	}

	public async getSyncProduct(id: number) {
		const {
			data: { result },
		} = await ProductsApiService.getSyncProductById({
			path: {
				id,
			},
		});
		return result;
	}

	public async createOrUpdateProduct(
		productId: number,
		container: MedusaContainer
	): Promise<void> {
		const [{ sync_product, sync_variants }, product] = await Promise.all([
			this.getSyncProduct(productId),
			this.getProductByPrintfulProductId(productId),
		]);
		await this.syncProduct(sync_product, sync_variants, product, container);
	}

	public async deleteProduct(
		productId: number,
		container: MedusaContainer
	): Promise<void> {
		const product = await this.getProductByPrintfulProductId(productId);
		if (!product) {
			return;
		}

		await this.deleteMedusaProduct(product.id, container);
	}

	public async syncProducts(container: MedusaContainer): Promise<void> {
		const {
			data: { result },
		} = await ProductsApiService.getSyncProducts({
			query: {
				status: 'synced',
			},
		});

		await Promise.all(
			result.map(({ id: productId }) =>
				this.createOrUpdateProduct(productId, container)
			)
		);
	}

	protected buildProductId(productId: number) {
		return `printful_product_${productId}`;
	}

	protected async getProductByPrintfulProductId(productId: number) {
		const [products, count] =
			await this.productModuleService.listAndCountProducts(
				{
					id: this.buildProductId(productId),
				},
				{
					take: 1,
					relations: ['tags', 'options', 'variants'],
				}
			);

		if (count === 0) {
			return null;
		}

		return products[0];
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected async getPackingSlip(order: OrderDTO): Promise<PackingSlip> {
		return {};
	}

	/**
	 * Syncs a product from Printful to Medusa.
	 * If the product already exists in Medusa, it will update the product.
	 * @param syncProduct The product to sync
	 * @param syncVariants The variants to sync
	 * @param product The optional product in Medusa
	 * @param container The Medusa container
	 * @private
	 */
	private async syncProduct(
		syncProduct: SyncProduct,
		syncVariants: SyncVariant[],
		product: ProductDTO | null,
		container: MedusaContainer
	): Promise<ProductDTO> {
		const { allFiles, allColors, allSizes } = multiMap(
			syncVariants,
			{
				allFiles: (variant) => variant.files,
				allSizes: (variant) => [variant.size],
				allColors: (variant) => [variant.color],
			},
			{
				uniqByConfig: {
					allFiles: (file) => file.preview_url,
					allSizes: (size) => size,
					allColors: (color) => color,
				},
				filterConfig: {
					allFiles: (file) =>
						file.type === 'preview' &&
						file.preview_url !== undefined &&
						file.preview_url !== null &&
						file.preview_url !== '',
					allSizes: (size) => size !== null && size !== '',
					allColors: (color) => color !== null && color !== '',
				},
			}
		);

		const images: UpsertProductImageDTO[] = allFiles.map((file) => ({
			url: file.preview_url,
			metadata: {
				printful_id: file.id,
			},
		}));

		const rawOptions: CreateProductOptionDTO[] = [
			{ title: ColorKey, values: allColors },
			{ title: SizeKey, values: allSizes },
		];

		const options = map(
			groupBy(rawOptions, (option) => option.title),
			(values) =>
				values.map(({ values, ...rest }) => ({
					...rest,
					values: uniq(values),
				}))
		).flat();

		const variants: CreateProductVariantWorkflowInputDTO[] = syncVariants.map(
			(variant) => ({
				title: variant.name,
				sku: variant.sku,
				options: {
					[ColorKey]: variant.color,
					[SizeKey]: variant.size,
				},
				metadata: {
					printful_variant: variant,
				},
				manage_inventory: false,
				allow_backorder: true,
				prices: [
					{
						amount: variant.retail_price,
						currency_code: variant.currency.toLowerCase(),
					},
				],
			})
		);

		const printfulTag = await this.getPrintfulTag();

		if (!product) {
			const createProductDTO: CreateProductWorkflowInputDTO = {
				id: this.buildProductId(syncProduct.id),
				title: syncProduct.name,
				external_id: `${syncProduct.id}`,
				handle: kebabCase(syncProduct.name),
				thumbnail: syncProduct.thumbnail_url,
				images: images,
				options: options,
				status: 'draft',
				variants: variants,
				metadata: {
					is_printful: true,
				},
				tag_ids: [printfulTag.id],
			};

			const { result } = await createProductsWorkflow(container).run({
				input: {
					products: [createProductDTO],
				},
			});

			return result[0];
		} else {
			await Promise.all([
				deleteProductOptionsWorkflow(container).run({
					input: {
						ids: product.options.map((i) => i.id),
					},
				}),
				deleteProductVariantsWorkflow(container).run({
					input: {
						ids: product.variants.map((i) => i.id),
					},
				}),
			]);

			const { result } = await updateProductsWorkflow(container).run({
				input: {
					products: [
						{
							id: this.buildProductId(syncProduct.id),
							title: syncProduct.name,
							external_id: `${syncProduct.id}`,
							handle: kebabCase(syncProduct.name),
							thumbnail: syncProduct.thumbnail_url,
							images: uniq(images.concat(product?.images || [])),
							options: options,
							status: product.status,
							variants: variants,
							metadata: {
								...product.metadata,
								is_printful: true,
							},
							tag_ids: uniq([
								...(product.tags || []).map((i) => i.id),
								printfulTag.id,
							]),
						},
					],
				},
			});
			return result[0];
		}
	}

	private async getPrintfulTag() {
		const result = await this.productModuleService.listProductTags({
			value: 'printful',
		});
		if (result.length === 0) {
			throw new Error('Printful tag not found');
		}

		return result[0];
	}
}
