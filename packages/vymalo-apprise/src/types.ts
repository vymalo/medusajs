import type { ProviderSendNotificationDTO } from '@medusajs/framework/types';
import type { AxiosInstance, CreateAxiosDefaults } from 'axios';

export type Options = {
	client: CreateAxiosDefaults | (() => Promise<AxiosInstance>);
	handlers: {
		[channel: string]: ChannelHandler;
	};
};

export type ChannelHandler = (
	notification: ProviderSendNotificationDTO,
) => AppriseNotificationPayload[];

export type AppriseNotificationPayload = {
	urls: string[];
	body: string;
	title: string;
	type?: 'info' | 'warning' | 'failure';
	format?: 'text' | 'markdown' | 'html';
	tag?: string;
};
