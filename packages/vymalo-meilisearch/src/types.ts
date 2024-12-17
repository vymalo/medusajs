import type { SearchTypes } from '@medusajs/types';
import type { AbstractSearchService } from '@medusajs/utils';
import type { Config, Filter } from 'meilisearch';

export type Options = MeilisearchAddOnOptions;

export enum MeilisearchModules {
	meilisearch = 'meilisearch',
}

export interface IMeilisearchService extends AbstractSearchService {
	get defaultIndex(): string;
}

declare module '@medusajs/types' {
	interface ModuleImplementations {
		[MeilisearchModules.meilisearch]: IMeilisearchService;
	}
}

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

export type SearchOption = {
	filter?: Filter;
	paginationOptions: Record<'offset' | 'limit', number>;
	additionalOptions: Record<string, unknown>;
};
