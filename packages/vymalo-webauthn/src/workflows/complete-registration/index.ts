import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import validateRegistrationOptionsStep from './steps/validate-registration-options';
import type { ValidateRegistrationOptionsStepInput } from './steps/validate-registration-options';

const validateRegistrationOptionsWorkflow = createWorkflow(
	'valdiate-registration-options',
	(input: ValidateRegistrationOptionsStepInput) => {
		const success = validateRegistrationOptionsStep(input);

		return new WorkflowResponse(success);
	},
);

export default validateRegistrationOptionsWorkflow;
