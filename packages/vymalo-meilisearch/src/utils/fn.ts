import { variantKeys } from '@medusajs/utils';
import type { ProductDTO } from '@medusajs/types';

const prefix = `variant`;

export const transformProduct = (product: ProductDTO): Record<string, any> => {
	const transformedProduct = { ...product } as Record<string, unknown>;

	const initialObj: Record<string, string[]> = variantKeys.reduce(
		(obj, key) => {
			obj[`${prefix}_${key}`] = [];
			return obj;
		},
		{} as Record<string, string[]>
	);
	initialObj[`${prefix}_options_value`] = [];

	const flattenedVariantFields = (product.variants || []).reduce(
		(obj, variant) => {
			variantKeys.forEach((k) => {
				if (k === 'options' && variant[k]) {
					const values = variant[k].map((option) => option.value);
					obj[`${prefix}_options_value`] =
						obj[`${prefix}_options_value`].concat(values);
					return;
				}
				const variantVal = (variant as any)[k];
				return variantVal && obj[`${prefix}_${k}`].push(variantVal);
			});
			return obj;
		},
		initialObj
	);

	transformedProduct.type_value = product.type && product.type.value;
	transformedProduct.collection_title =
		product.collection && product.collection.title;
	transformedProduct.collection_handle =
		product.collection && product.collection.handle;
	transformedProduct.tags_value = product.tags
		? product.tags.map((t) => t.value)
		: [];
	transformedProduct.categories = (product?.categories || []).map(
		(c) => c.name
	);

	return {
		...transformedProduct,
		...flattenedVariantFields,
	};
};
