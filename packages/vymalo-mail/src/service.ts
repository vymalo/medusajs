import {
	Logger,
	ProviderSendNotificationDTO,
	ProviderSendNotificationResultsDTO,
} from '@medusajs/framework/types';
import {
	AbstractNotificationProviderService,
	isString,
} from '@medusajs/framework/utils';
import { Options } from './types';
import type Email from 'email-templates';

type InjectedDependencies = {
	logger: Logger;
	email_client: Email;
};

export default class MailService extends AbstractNotificationProviderService {
	public static identifier = 'vymalo-mail';
	public static DISPLAY_NAME = 'Simple Mail Notification';
	protected readonly logger: Logger;
	protected readonly options: Options;
	protected readonly email: Email;

	constructor({ logger, email_client }: InjectedDependencies, options: Options) {
		// @ts-ignore
		super(...arguments);

		this.logger = logger;
		this.options = options;
		this.email = email_client;
	}

	static validateOptions(options: Options) {
		if (!isString(options.message?.from)) {
			throw new Error('Missing required option: "options.message?.from"');
		}
	}

	public async send(
		notification: ProviderSendNotificationDTO
	): Promise<ProviderSendNotificationResultsDTO> {
		this.logger.info(`Sending email notification to ${notification.to}`);
		if (notification.channel !== 'email') {
			throw new Error('Channel not supported');
		}

		await this.email.send({
			template: notification.template,
			message: {
				to: notification.to,
				attachments: notification.attachments,
			},
			locals: notification.data,
		});

		this.logger.info(`Email notification sent to ${notification.to}`);
		return {};
	}
}
