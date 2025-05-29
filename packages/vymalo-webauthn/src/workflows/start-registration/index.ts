import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import validateRegistrationOptionsStep from './steps/start-registration-options';
import type { StartRegistrationOptionsStepInput } from './steps/start-registration-options';

const startRegistrationOptionsWorkflow = createWorkflow(
	'start-registration-options',
	(input: StartRegistrationOptionsStepInput) => {
		const options = validateRegistrationOptionsStep(input);

		return new WorkflowResponse(options);
	},
);

export default startRegistrationOptionsWorkflow;
