import { defineConfig } from '@hey-api/openapi-ts';
import { defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
	input: 'openapi.json',
	output: {
		lint: 'eslint',
		format: 'prettier',
		path: 'src/core/generated/printful',
	},
	plugins: [
		...defaultPlugins,
		{
			name: '@hey-api/client-axios',
			throwOnError: true,
		},
		{
			dates: true,
			name: '@hey-api/transformers',
		},
		{
			name: '@hey-api/sdk',
			asClass: true,
			transformer: true,
		},
	],
});
