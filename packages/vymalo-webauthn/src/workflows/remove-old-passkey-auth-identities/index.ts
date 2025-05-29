import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import removeOldNonPasskeyAuthIdentitiesStep from './steps/remove-old-non-passkey-auth-Identities-step';

const removeOldNonPasskeyAuthIdentitiesWorkflow = createWorkflow(
	'remove-old-passkey-auth-identities',
	() => {
		const success = removeOldNonPasskeyAuthIdentitiesStep();

		return new WorkflowResponse(success);
	},
);

export default removeOldNonPasskeyAuthIdentitiesWorkflow;
