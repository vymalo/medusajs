import type {
	Logger,
	ProviderSendNotificationDTO,
	ProviderSendNotificationResultsDTO,
} from '@medusajs/framework/types';
import { AbstractNotificationProviderService } from '@medusajs/framework/utils';
import type { AxiosInstance } from 'axios';
import type { AppriseNotificationPayload, Options } from './types';

type InjectedDependencies = {
	logger: Logger;
	axios_client: AxiosInstance;
};

export default class AppriseService extends AbstractNotificationProviderService {
	public static identifier = 'vymalo-apprise';
	public static DISPLAY_NAME = 'Apprise Notification';
	protected readonly logger: Logger;
	protected readonly options: Options;
	protected readonly axios: AxiosInstance;

	constructor(
		{ logger, axios_client }: InjectedDependencies,
		options: Options,
	) {
		// @ts-ignore
		super(...arguments);

		this.logger = logger;
		this.options = options;
		this.axios = axios_client;
	}

	static validateOptions(options: Options) {
		if (!Object.keys(options.handlers).length) {
			throw new Error('No handlers were found.');
		}
	}

	public async send(
		notification: ProviderSendNotificationDTO,
	): Promise<ProviderSendNotificationResultsDTO> {
		this.logger.info(`Sending notification to ${notification.to}`);
		const channelHandlers =
			this.options.handlers?.[notification.channel]?.(notification);

		await Promise.all(
			channelHandlers.map(async (handler) => {
				await this.sendToApprise(handler);
			}),
		);

		this.logger.info(`Apprise notification sent to ${notification.to}`);
		return {};
	}

	protected async sendToApprise(payload: AppriseNotificationPayload) {
		await this.axios.post('/notify', payload);
	}
}
