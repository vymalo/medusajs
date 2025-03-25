import type { AbstractSearchService } from '@medusajs/utils';

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
