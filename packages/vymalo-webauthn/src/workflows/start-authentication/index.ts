import {
	type WorkflowData,
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import getAuthOptions from './steps/get-auth-options-step';

export type StartAuthenticationWorkflow = {
	username: string;
};

export type StartAuthenticationWorkflowResponse = {
	authId: string;
	options: PublicKeyCredentialRequestOptionsJSON;
};

export const startAuthenticationWorkflow = createWorkflow(
	'start-authentication',
	(
		input: WorkflowData<StartAuthenticationWorkflow>,
	): WorkflowResponse<StartAuthenticationWorkflowResponse> => {
		const options = getAuthOptions(input);

		return new WorkflowResponse(options);
	},
);
