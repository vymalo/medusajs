import type { ProductDTO } from '@medusajs/types';
import { variantKeys } from '@medusajs/utils';

const prefix = 'variant';

export const transformProduct = (product: ProductDTO): Record<string, any> => {
	const transformedProduct = { ...product } as Record<string, unknown>;

	const initialObj: Record<string, string[]> = variantKeys.reduce(
		(obj, key) => {
			obj[`${prefix}_${key}`] = [];
			return obj;
		},
		{} as Record<string, string[]>,
	);
	initialObj[`${prefix}_options_value`] = [];

	const flattenedVariantFields = (product.variants || []).reduce(
		(obj, variant) => {
			for (const k of variantKeys) {
				if (k === 'options' && variant[k]) {
					const values = variant[k].map((option) => option.value);
					obj[`${prefix}_options_value`] =
						obj[`${prefix}_options_value`].concat(values);
					continue;
				}
				const variantVal = (variant as any)[k];
				variantVal && obj[`${prefix}_${k}`].push(variantVal);
			}
			return obj;
		},
		initialObj,
	);

	transformedProduct.type_value = product.type?.value;
	transformedProduct.collection_title = product.collection?.title;
	transformedProduct.collection_handle = product.collection?.handle;
	transformedProduct.tags_value = product.tags
		? product.tags.map((t) => t.value)
		: [];
	transformedProduct.categories = (product?.categories || []).map(
		(c) => c.name,
	);

	return {
		...transformedProduct,
		...flattenedVariantFields,
	};
};
