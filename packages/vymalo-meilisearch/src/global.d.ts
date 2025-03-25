declare module 'app-options' {
	import type { Config, Filter } from 'meilisearch';
	import type { SearchTypes } from '@medusajs/types';

	type Options = MeilisearchAddOnOptions;

	type SearchOption = {
		filter?: Filter;
		paginationOptions: Record<'offset' | 'limit', number>;
		additionalOptions: Record<string, unknown>;
	};

	interface MeilisearchAddOnOptions {
		/**
		 * Meilisearch client configuration
		 */
		config: Config;
		/**
		 * Index settings
		 */
		settings?: {
			[key: string]: SearchTypes.IndexSettings;
		};
	}
}

declare module 'meilisearch-options' {
	export * from 'meilisearch';
}
