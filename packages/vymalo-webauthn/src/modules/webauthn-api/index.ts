import { Module } from '@medusajs/framework/utils';
import WebAuthnApiService from './service';

export default Module(WebAuthnApiService.identifier, {
	service: WebAuthnApiService,
});
