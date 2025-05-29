import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import mailLoader from './loader';
import MailService from './service';

export default ModuleProvider(Modules.NOTIFICATION, {
	services: [MailService],
	loaders: [mailLoader],
});

export * from './types';
