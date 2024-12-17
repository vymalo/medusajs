import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

export const POST = async (req: MedusaRequest<never>, res: MedusaResponse) => {
	const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
	const eventBusService = req.scope.resolve(Modules.EVENT_BUS);

	try {
		await eventBusService.emit({
			name: 'printful.meta.sync_products',
			data: {},
		});

		res.json({
			ok: true,
		});
	} catch (error) {
		logger.error(
			'Error occurred while launching the Sync event',
			error as Error,
		);
		res
			.status(500)
			.send({ error: 'Error occurred while launching the Sync event' });
	}
};
