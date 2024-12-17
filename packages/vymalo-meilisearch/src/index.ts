import Meilisearch from './services';
import meilisearchLoader from './loaders';
import { MeilisearchModules } from './types';
import { Module } from '@medusajs/utils';

export default Module(MeilisearchModules.meilisearch, {
	service: Meilisearch,
	loaders: [meilisearchLoader],
});

export * from './types';
export * from './utils';
