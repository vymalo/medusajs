import {
	type MedusaNextFunction,
	type MedusaRequest,
	type MedusaResponse,
	authenticate,
	defineMiddlewares,
	validateAndTransformBody,
} from '@medusajs/framework/http';
import type { ConfigModule } from '@medusajs/framework/types';
import { parseCorsOrigins } from '@medusajs/framework/utils';
import { AdminCreateProduct } from '@medusajs/medusa/api/admin/products/validators';
import cors from 'cors';
import { PostVendorCreateSchema } from './vendors/route';

export default defineMiddlewares({
	routes: [
		{
			matcher: '/vendors',
			method: ['POST'],
			middlewares: [
				authenticate('vendor', ['session', 'bearer'], {
					allowUnregistered: true,
				}),
				validateAndTransformBody(PostVendorCreateSchema),
			],
		},
		{
			matcher: '/vendors/*',
			middlewares: [authenticate('vendor', ['session', 'bearer'])],
		},
		{
			matcher: '/vendors/products',
			method: ['POST'],
			middlewares: [validateAndTransformBody(AdminCreateProduct)],
		},
		{
			matcher: '/vendors',
			middlewares: [
				(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
					const configModule: ConfigModule = req.scope.resolve('configModule');

					return cors({
						origin: parseCorsOrigins(configModule.projectConfig.http.storeCors),
						credentials: true,
					})(req, res, next);
				},
			],
		},
	],
});
