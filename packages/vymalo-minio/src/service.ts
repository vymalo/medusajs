import { Client } from 'minio';
import {
	Logger,
	ProviderDeleteFileDTO,
	ProviderFileResultDTO,
	ProviderGetFileDTO,
	ProviderUploadFileDTO,
} from '@medusajs/framework/types';
import {
	AbstractFileProviderService,
	MedusaError,
} from '@medusajs/framework/utils';
import { parse } from 'path';

type InjectedDependencies = {
	logger: Logger;
};

export type Options = {
	endpoint: string;
	cdn_url: string;
	bucket: string;
	private_bucket?: string;
	access_key_id: string;
	secret_access_key: string;
	download_url_duration?: number;
};

export default class MinioService extends AbstractFileProviderService {
	protected cdn_url_: string;
	protected bucket_: string;
	protected private_bucket_: string;
	protected downloadUrlDuration: number;
	protected client: Client;
	protected logger_: Logger;

	static identifier = 'minio-file-service';

	constructor({ logger }: InjectedDependencies, options: Options) {
		super();

		this.logger_ = logger;
		this.cdn_url_ = options.cdn_url;
		this.bucket_ = options.bucket;
		this.private_bucket_ = options.private_bucket;

		this.downloadUrlDuration = options.download_url_duration ?? 60; // 60 seconds

		const url = new URL(options.endpoint);
		this.client = new Client({
			endPoint: url.hostname,
			port: parseInt(url.port),
			useSSL: url.protocol === 'https:',
			accessKey: options.access_key_id,
			secretKey: options.secret_access_key,
		});
	}

	static validateOptions(options: Partial<Options>) {
		const requiredFields: (keyof Options)[] = [
			'endpoint',
			'cdn_url',
			'bucket',
			'access_key_id',
			'secret_access_key',
		];
		requiredFields.forEach((field) => {
			if (!options[field]) {
				throw new MedusaError(
					MedusaError.Types.INVALID_DATA,
					`Minio file service is missing required field: ${field}`
				);
			}
		});
	}

	public async upload(
		file: ProviderUploadFileDTO
	): Promise<ProviderFileResultDTO> {
		this.logger_.debug(`Uploading file ${file.filename} to Minio`);
		const parsedFilename = parse(file.filename);
		const fileKey = `files/${parsedFilename.name}-${Date.now()}${parsedFilename.ext}`;
		const isPrivate = file.access === 'private';
		const bucket = isPrivate ? this.private_bucket_ : this.bucket_;

		const content = Buffer.from(file.content, 'binary');
		await this.client.putObject(bucket, fileKey, content, undefined, {
			ACL: isPrivate ? 'private' : 'public-read',
			CacheControl: 'public, max-age=31536000, immutable',
			ContentType: file.mimeType,
			Metadata: {
				'x-amz-meta-original-filename': file.filename,
			},
		});
		this.logger_.debug(`File ${file.filename} uploaded to Minio`);

		return { url: this.buildUrl(bucket, fileKey), key: fileKey };
	}

	getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
		return this.client.presignedUrl(
			'GET',
			this.bucket_,
			fileData.fileKey,
			this.downloadUrlDuration
		);
	}

	public async delete(file: ProviderDeleteFileDTO): Promise<void> {
		this.logger_.debug(`Deleting file ${file.fileKey} from Minio`);
		await Promise.all([
			this.client.removeObject(this.bucket_, file.fileKey),
			this.client.removeObject(this.private_bucket_, file.fileKey),
		]);
	}

	protected buildUrl(bucket: string, key: string) {
		this.logger_.debug(`Building url for ${key} in bucket ${bucket}`);
		return `${this.cdn_url_}/${bucket}/${key}`;
	}
}
