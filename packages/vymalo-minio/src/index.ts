import MinioService from './service';
import { ModuleProvider, Modules } from '@medusajs/framework/utils';

export default ModuleProvider(Modules.FILE, {
	services: [MinioService],
});
