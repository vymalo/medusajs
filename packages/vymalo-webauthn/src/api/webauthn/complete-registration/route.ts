import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { MedusaError } from '@medusajs/framework/utils';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import validateRegistrationOptionsWorkflow from '../../../workflows/complete-registration';

export const POST = async (
	req: AuthenticatedMedusaRequest<RegistrationResponseJSON>,
	res: MedusaResponse,
) => {
	if (req.auth_context?.actor_id) {
		throw new MedusaError(
			MedusaError.Types.INVALID_DATA,
			'Request already authenticated as a vendor.',
		);
	}

	try {
		const { result } = await validateRegistrationOptionsWorkflow(req.scope).run(
			{
				input: {
					authIdentityId: req.auth_context.auth_identity_id,
					payload: req.body,
				},
			},
		);

		res.json({
			result: result,
		});
	} catch (e) {
		console.error('miaou =>', e);

		res.status(400).send({
			e,
		});
	}
};
