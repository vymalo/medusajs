import type { Client } from 'minio';
import type {
	Logger,
	ProviderDeleteFileDTO,
	ProviderFileResultDTO,
	ProviderGetFileDTO,
	ProviderUploadFileDTO,
} from '@medusajs/framework/types';
import { AbstractFileProviderService } from '@medusajs/framework/utils';
import { parse } from 'path';
import type { Options } from './types';

type InjectedDependencies = {
	logger: Logger;
	minio_client: Client;
};

export default class MinioService extends AbstractFileProviderService {
	public static identifier = 'vymalo-minio-file-service';
	public static DISPLAY_NAME = 'Minio File Service';

	protected readonly client: Client;
	protected readonly logger: Logger;
	protected readonly options: Options;

	constructor(
		{ logger, minio_client }: InjectedDependencies,
		options: Options
	) {
		// @ts-ignore
		super(...arguments);

		this.logger = logger;
		this.client = minio_client;
		this.options = options;
	}

	public async upload(
		file: ProviderUploadFileDTO
	): Promise<ProviderFileResultDTO> {
		this.logger.debug(`Uploading file ${file.filename} to Minio`);

		const parsedFilename = parse(file.filename);
		const fileKey = `files/${parsedFilename.name}-${Date.now()}${parsedFilename.ext}`;
		const isPrivate = file.access === 'private';
		const bucket = isPrivate
			? this.options.private_bucket
			: this.options.bucket;

		const content = Buffer.from(file.content, 'binary');
		await this.client.putObject(bucket, fileKey, content, undefined, {
			ACL: isPrivate ? 'private' : 'public-read',
			CacheControl: 'public, max-age=31536000, immutable',
			ContentType: file.mimeType,
			Metadata: {
				'x-amz-meta-original-filename': file.filename,
			},
		});
		this.logger.debug(`File ${file.filename} uploaded to Minio`);

		return { url: this.buildUrl(bucket, fileKey), key: fileKey };
	}

	getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
		return this.client.presignedUrl(
			'GET',
			this.options.bucket,
			fileData.fileKey,
			this.options.download_url_duration
		);
	}

	public async delete(file: ProviderDeleteFileDTO): Promise<void> {
		this.logger.debug(`Deleting file ${file.fileKey} from Minio`);
		await Promise.all([
			this.client.removeObject(this.options.bucket, file.fileKey),
			this.client.removeObject(this.options.private_bucket, file.fileKey),
		]);
	}

	protected buildUrl(bucket: string, key: string) {
		this.logger.debug(`Building url for ${key} in bucket ${bucket}`);
		return `${this.options.cdn_url}/${bucket}/${key}`;
	}
}
