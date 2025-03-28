export interface Options {
	endpoint: string;
	cdn_url: string;
	bucket: string;
	access_key_id: string;
	secret_access_key: string;
	download_url_duration: number;
	private_bucket?: string;
}
