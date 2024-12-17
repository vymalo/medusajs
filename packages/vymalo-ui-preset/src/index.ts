import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss/types/config';

const coreVymaloTheme = {
	primary: '#c738e1', // Harmonized magenta
	'primary-content': '#f5e6f8', // Lighter for better contrast
	secondary: '#00a300', // Darker green for a less vibrant feel
	'secondary-content': '#d1f3d1', // Softer green for contrast
	accent: '#00b873', // Muted green to match the secondary
	'accent-content': '#e0f7e0', // Softer light green
	neutral: '#282828', // Slightly lighter neutral for smoother look
	'neutral-content': '#e1e1e1', // Softer contrast with neutral
	'base-100': '#201b2c', // Base color for a dark theme
	'base-200': '#1a1523',
	'base-300': '#16101d',
	'base-content': '#e4dfe6', // Lighter for better legibility
	info: '#005bbd', // Darker blue for a calmer feel
	'info-content': '#e0f0fa', // Softer light blue for content
	success: '#00c362', // Harmonized green
	'success-content': '#e1f6eb', // Lighter success content
	warning: '#ff6a00', // Slightly softened orange
	'warning-content': '#f4dfd6', // Light beige for contrast
	error: '#eb0032', // Harmonized red
	'error-content': '#ffe6ea', // Softer pinkish tone for content
};

const lightVymaloTheme = {
	primary: '#c700e6', // Slightly softer magenta to match the dark theme
	'primary-content': '#f7e5fc', // Lighter for contrast
	secondary: '#d10000', // Softened red
	'secondary-content': '#ffe1dd', // Softer light red for readability
	accent: '#00d479', // Muted green to harmonize with dark accent
	'accent-content': '#dff7e7', // Softened green content
	neutral: '#f2f2f2', // Lightened neutral for consistency
	'neutral-content': '#202020', // Dark content for neutral contrast
	'base-100': '#efefef', // Clean white for base
	'base-200': '#dedcdc',
	'base-300': '#bcbcbc',
	'base-content': '#1e1e1e', // Darker content for contrast
	info: '#00b0e0', // Softer blue for less harsh info
	'info-content': '#eef9ff', // Softer light blue for content
	success: '#6bc84f', // Softer green for success
	'success-content': '#f2f9f2', // Lighter content for contrast
	warning: '#ff9500', // Harmonized with dark theme
	'warning-content': '#fff1db', // Light beige for contrast
	error: '#ff4b57', // Softer red for light theme
	'error-content': '#ffe6e8', // Lightened for contrast
};

const basePreset: Omit<Config, 'content'> = {
	theme: {
		extend: {
			fontSize: {
				'3xl': '2rem',
			},
			fontFamily: {
				sans: ['Louis George Cafe', ...fontFamily.sans],
				serif: ['Louis George Cafe', ...fontFamily.serif],
				mono: ['Louis George Cafe', ...fontFamily.mono],
			},
		},
	},
	plugins: [
		require('@tailwindcss/aspect-ratio'),
		require('tailwind-extended-shadows'),
		require('@tailwindcss/typography'),
		require('tailwindcss-radix')({}),
		require('@tailwindcss/forms')({ strategy: 'class' }),
		require('daisyui'),
	],
	daisyui: {
		themes: [
			{
				'vymalo-light': lightVymaloTheme,
			},
			{
				'vymalo-dark': coreVymaloTheme,
			},
		],
	},
	darkMode: ['class', '[data-theme="vymalo-dark"]'],
};

export default basePreset;