import {
	filter,
	ListIterateeCustom,
	reduce,
	uniqBy,
	ValueIteratee,
} from 'lodash';

export function multiMap<T, Fns extends Record<string, (item: T) => any[]>>(
	arr: T[],
	fns: Fns,
	{
		filterConfig,
		uniqByConfig,
	}: {
		filterConfig?: {
			[K in keyof Fns]?: ListIterateeCustom<ReturnType<Fns[K]>[0], boolean>;
		};
		uniqByConfig?: { [K in keyof Fns]?: ValueIteratee<ReturnType<Fns[K]>[0]> };
	} = {}
): { [K in keyof Fns]: ReturnType<Fns[K]> } {
	const result = reduce<T, { [K in keyof Fns]: ReturnType<Fns[K]> }>(
		arr,
		(acc, item) => {
			for (const fnKey in fns) {
				const fn = fns[fnKey];

				const value = fn(item);
				const previous = acc[fnKey] ?? <ReturnType<typeof fn>>[];
				acc[fnKey] = previous.concat(value) as ReturnType<typeof fn>;
			}
			return acc;
		},
		{} as { [K in keyof Fns]: ReturnType<Fns[K]> }
	);

	for (const resultKey in result) {
		const filterFn = filterConfig[resultKey];
		if (filterFn) {
			type LocalType = ReturnType<Fns[typeof resultKey]>;
			result[resultKey] = filter(result[resultKey], filterFn) as LocalType;
		}

		const uniqFn = uniqByConfig[resultKey];
		if (uniqFn) {
			type LocalType = ReturnType<Fns[typeof resultKey]>;
			result[resultKey] = uniqBy(result[resultKey], uniqFn) as LocalType;
		}
	}

	return result;
}
