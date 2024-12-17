import MailService from './service';
import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import mailLoader from './loader';

export default ModuleProvider(Modules.NOTIFICATION, {
	services: [MailService],
	loaders: [mailLoader],
});

export * from './types';
