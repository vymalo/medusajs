import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import {
	type StartAuthenticationWorkflow,
	startAuthenticationWorkflow,
} from '../../../workflows/start-authentication';

export const POST = async (
	req: MedusaRequest<StartAuthenticationWorkflow>,
	res: MedusaResponse,
) => {
	const { result } = await startAuthenticationWorkflow(req.scope).run({
		input: {
			username: req.body.username,
		},
	});

	res.json({
		authId: result.authId,
		options: result.options,
	});
};
