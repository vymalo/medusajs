import {
	type MedusaNextFunction,
	type MedusaRequest,
	type MedusaResponse,
	authenticate,
	defineMiddlewares,
} from '@medusajs/framework/http';
import type { ConfigModule } from '@medusajs/framework/types';
import { parseCorsOrigins } from '@medusajs/framework/utils';
import cors from 'cors';

export default defineMiddlewares({
	routes: [
		{
			matcher: '/webauthn/start-registration',
			method: ['POST'],
			middlewares: [
				authenticate(['vendor', 'customer'], ['session', 'bearer'], {
					allowUnregistered: true,
				}),
			],
		},
		{
			matcher: '/webauthn/complete-registration',
			method: ['POST'],
			middlewares: [
				authenticate(['vendor', 'customer'], ['session', 'bearer'], {
					allowUnregistered: true,
				}),
			],
		},
		{
			matcher: '/webauthn/start-authentication',
			method: ['POST'],
		},
		{
			matcher: '/webauthn/*',
			middlewares: [
				(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
					const configModule: ConfigModule = req.scope.resolve('configModule');

					return cors({
						origin: parseCorsOrigins(configModule.projectConfig.http.authCors),
						credentials: true,
					})(req, res, next);
				},
			],
		},
	],
});
