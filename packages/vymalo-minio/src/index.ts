import MinioService from './service';
import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import minioLoader from './loader';

export default ModuleProvider(Modules.FILE, {
	services: [MinioService],
	loaders: [minioLoader as any],
});
