import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	res.json({
		message: '[GET] Hello world!',
	});
};
