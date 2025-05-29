import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	res.json({
		message: "There's nothing here",
	});
};
