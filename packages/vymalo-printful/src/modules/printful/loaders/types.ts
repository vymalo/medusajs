import { PrintfulOptions } from '../../../types';

export type Options = Pick<
	PrintfulOptions,
	'backendUrl' | 'storeId' | 'printfulAccessToken' | 'enableWebhooks'
>;
