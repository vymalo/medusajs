import type { Logger, ProductDTO, SearchTypes } from '@medusajs/types';
import { AbstractSearchService, SearchUtils } from '@medusajs/utils';
import type { Options, SearchOption } from '../types';
import { IMeilisearchService } from '../types';
import type {
	EnqueuedTask,
	Index,
	IndexOptions,
	MeiliSearch,
	SearchParams,
	SearchResponse,
} from 'meilisearch' with { 'resolution-mode': 'import' };
import { transformProduct } from '../utils';

type InjectedDependencies = {
	logger: Logger;
	meilisearch_client: MeiliSearch;
};

export default class MeiliSearchService<
		P extends ProductDTO = ProductDTO,
		I extends Required<IndexOptions> = Required<IndexOptions>,
	>
	extends AbstractSearchService
	implements IMeilisearchService
{
	public static identifier = 'vymalo-meilisearch';
	public static DISPLAY_NAME = 'Meilisearch Search';
	isDefault: boolean = false;
	public readonly defaultIndex: string = 'products';
	protected readonly logger: Logger;
	protected readonly client: MeiliSearch;
	protected readonly settings: Options['settings'];

	constructor(deps: InjectedDependencies, options: Options) {
		super(deps, options);

		this.logger = deps.logger;
		this.client = deps.meilisearch_client;
		this.settings = options.settings;
	}

	async createIndex<O extends I = I>(
		indexName: string = this.defaultIndex,
		options: O
	): Promise<EnqueuedTask> {
		return await this.client.createIndex(indexName, options);
	}

	async getIndex<T extends P = P>(indexName: string): Promise<Index<T>> {
		return await this.client.getIndex(indexName);
	}

	async addDocuments<T extends P = P, D extends T = T>(
		indexName: string,
		documents: D[],
		type: string
	): Promise<EnqueuedTask> {
		const transformedDocuments = await this.getTransformedDocuments<T, D>(
			type,
			documents
		);

		return await this.client
			.index<T>(indexName)
			.addDocuments(transformedDocuments, { primaryKey: 'id' });
	}

	async replaceDocuments<T extends P = P, D extends T = T>(
		indexName: string,
		documents: D[],
		type: string
	): Promise<EnqueuedTask> {
		const transformedDocuments = await this.getTransformedDocuments<T, D>(
			type,
			documents
		);

		return await this.client
			.index(indexName)
			.addDocuments(transformedDocuments, { primaryKey: 'id' });
	}

	async deleteDocument(
		indexName: string,
		document_id: string | number
	): Promise<EnqueuedTask> {
		return await this.client.index(indexName).deleteDocument(document_id);
	}

	async deleteAllDocuments(indexName: string): Promise<EnqueuedTask> {
		return await this.client.index(indexName).deleteAllDocuments();
	}

	async search<D extends P = P, S extends SearchParams = SearchParams>(
		indexName: string,
		query: string | null,
		options: SearchOption
	): Promise<SearchResponse<D, S>> {
		const { paginationOptions, filter, additionalOptions } = options;

		return await this.client
			.index<D>(indexName)
			.search(query, { filter, ...paginationOptions, ...additionalOptions });
	}

	async updateSettings(
		indexName: string,
		settings: SearchTypes.IndexSettings
	): Promise<EnqueuedTask> {
		const indexSettings = settings.indexSettings || {};

		await this.upsertIndex(indexName, settings);

		return await this.client.index(indexName).updateSettings(indexSettings);
	}

	protected async upsertIndex(
		indexName: string,
		settings: SearchTypes.IndexSettings
	): Promise<void> {
		try {
			await this.client.getIndex(indexName);
		} catch (error: unknown) {
			if (typeof error !== 'object') {
				throw error;
			}

			if ('code' in error && error.code === 'index_not_found') {
				await this.createIndex(indexName, {
					primaryKey: settings?.primaryKey || 'id',
				} as I);
			}
		}
	}

	protected async getTransformedDocuments<T extends P = P, R extends T = T>(
		type: string,
		documents: R[]
	): Promise<T[]> {
		if (!documents?.length) {
			return [];
		}

		switch (type) {
			case SearchUtils.indexTypes.PRODUCTS:
				const productsTransformer: typeof transformProduct =
					this.settings?.[SearchUtils.indexTypes.PRODUCTS]?.transformer ||
					transformProduct;
				return documents.map((p) => productsTransformer(p) as T);
			default:
				return documents;
		}
	}
}
