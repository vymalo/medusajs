import { Module } from '@medusajs/utils';
import meilisearchLoader from './loaders';
import Meilisearch from './services';
import { MeilisearchModules } from './types';

export default Module(MeilisearchModules.meilisearch, {
	service: Meilisearch,
	loaders: [meilisearchLoader],
});

export * from './types';
export * from './utils';
