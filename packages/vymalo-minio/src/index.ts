import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import { MinioService } from './service';

export default ModuleProvider(Modules.FILE, {
	services: [MinioService],
});
