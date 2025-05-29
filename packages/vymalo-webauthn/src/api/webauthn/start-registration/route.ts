import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { MedusaError } from '@medusajs/framework/utils';
import createRegistrationOptionsWorkflow from '../../../workflows/start-registration';

export const POST = async (
	req: AuthenticatedMedusaRequest<void>,
	res: MedusaResponse,
) => {
	if (req.auth_context?.actor_id) {
		throw new MedusaError(
			MedusaError.Types.INVALID_DATA,
			'Request already authenticated as a vendor.',
		);
	}

	const { result } = await createRegistrationOptionsWorkflow(req.scope).run({
		input: {
			authIdentityId: req.auth_context.auth_identity_id,
		},
	});

	res.json({
		options: result,
	});
};
