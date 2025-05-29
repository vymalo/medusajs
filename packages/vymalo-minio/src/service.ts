import { parse } from 'node:path';
import type { Readable } from 'node:stream';
import type {
	FileTypes,
	Logger,
	ProviderDeleteFileDTO,
	ProviderFileResultDTO,
	ProviderGetFileDTO,
	ProviderGetPresignedUploadUrlDTO,
	ProviderUploadFileDTO,
} from '@medusajs/framework/types';
import {
	AbstractFileProviderService,
	MedusaError,
} from '@medusajs/framework/utils';
import { Client } from 'minio';
import type { Options } from './types';

type InjectedDependencies = {
	logger: Logger;
};

export class MinioService extends AbstractFileProviderService {
	public static identifier = 'vymalo-minio-file-service';
	public static DISPLAY_NAME = 'Minio File Service';

	protected readonly client: Client;
	protected readonly logger: Logger;
	protected readonly options: Options;

	constructor({ logger }: InjectedDependencies, options: Options) {
		// @ts-ignore
		super(...arguments);

		this.logger = logger;
		this.options = options;

		const url = new URL(options.endpoint);
		this.client = new Client({
			endPoint: url.hostname,
			port: Number.parseInt(url.port),
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
		for (const field of requiredFields) {
			if (!options[field]) {
				throw new MedusaError(
					MedusaError.Types.INVALID_DATA,
					`Minio file service is missing required field: ${field}`,
				);
			}
		}
	}

	public async upload(
		file: ProviderUploadFileDTO,
	): Promise<ProviderFileResultDTO> {
		this.logger.debug(`Uploading file ${file.filename} to Minio`);

		const fileKey = this.options.buildKey?.(file) ?? this.buildKey(file);
		const isPrivate = file.access === 'private';
		const bucket =
			isPrivate && this.options.private_bucket
				? this.options.private_bucket
				: this.options.bucket;

		const customMeta = this.options.uploadMetadata?.(file) ?? {};
		const content = Buffer.from(file.content, 'binary');
		await this.client.putObject(bucket, fileKey, content, undefined, {
			ACL: isPrivate ? 'private' : 'public-read',
			CacheControl: 'public, max-age=31536000, immutable',
			ContentType: file.mimeType,
			...customMeta,
			Metadata: {
				'x-amz-meta-original-filename': file.filename,
				...(customMeta.Metadata ?? {}),
			},
		});
		this.logger.debug(`File ${file.filename} uploaded to Minio`);

		return { url: this.buildUrl(bucket, fileKey), key: fileKey };
	}

	public getPresignedDownloadUrl(
		fileData: ProviderGetFileDTO,
	): Promise<string> {
		return this.client.presignedUrl(
			'GET',
			this.options.bucket,
			fileData.fileKey,
			this.options.download_url_duration,
		);
	}

	public async getPresignedUploadUrl(
		fileData: ProviderGetPresignedUploadUrlDTO,
	): Promise<ProviderFileResultDTO> {
		const fileKey =
			this.options.buildKey?.(fileData) ?? this.buildKey(fileData);
		const link = await this.client.presignedPutObject(
			this.options.bucket,
			fileKey,
			fileData.expiresIn ?? this.options.upload_url_duration,
		);
		return {
			url: link,
			key: fileKey,
		};
	}

	public async getDownloadStream({
		fileKey,
		...rest
	}: FileTypes.ProviderGetFileDTO): Promise<Readable> {
		return await this.client.getObject(this.options.bucket, fileKey, rest);
	}

	public async delete(file: ProviderDeleteFileDTO): Promise<void> {
		this.logger.debug(`Deleting file ${file.fileKey} from Minio`);
		await Promise.all([
			this.client.removeObject(this.options.bucket, file.fileKey),
			this.options.private_bucket &&
				this.client.removeObject(this.options.private_bucket, file.fileKey),
		]);
	}

	protected buildKey(
		file: ProviderUploadFileDTO | ProviderGetPresignedUploadUrlDTO,
	) {
		const parsedFilename = parse(file.filename);
		return `files/${parsedFilename.name}-${Date.now()}${parsedFilename.ext}`;
	}

	protected buildUrl(bucket: string, key: string) {
		this.logger.debug(`Building url for ${key} in bucket ${bucket}`);
		return `${this.options.cdn_url}/${bucket}/${key}`;
	}
}
