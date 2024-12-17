import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
	client: {
		bundle: true,
		name: 'legacy/axios',
	},
	input: 'openapi.json',
	output: {
		lint: 'eslint',
		format: 'prettier',
		path: 'src/core/generated/printful',
	},
	debug: true,
	plugins: [
		{
			name: '@hey-api/types',
			enums: 'typescript',
			style: 'PascalCase',
		},
		{
			name: '@hey-api/services',
			asClass: true,
		},
	],
});
