import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss/types/config';
import { blue, green, grey, orange, purple, red } from '@mui/material/colors';

const coreVymaloTheme = {
	primary: purple[500], // Harmonized magenta
	'primary-content': purple[50], // Lighter for better contrast
	secondary: green[700], // Darker green for a less vibrant feel
	'secondary-content': green[100], // Softer green for contrast
	accent: green[500], // Muted green to match the secondary
	'accent-content': green[50], // Softer light green
	neutral: grey[900], // Slightly lighter neutral for smoother look
	'neutral-content': grey[800], // Softer contrast with neutral
	'base-100': grey[900], // Base color for a dark theme
	'base-200': grey[800],
	'base-300': grey[700],
	'base-content': grey[50], // Lighter for better legibility
	info: blue[700], // Darker blue for a calmer feel
	'info-content': blue[50], // Softer light blue for content
	success: green[600], // Harmonized green
	'success-content': green[50], // Lighter success content
	warning: orange[800], // Slightly softened orange
	'warning-content': orange[100], // Light beige for contrast
	error: red[800], // Harmonized red
	'error-content': red[50], // Softer pinkish tone for content
};

const lightVymaloTheme = {
	primary: purple[400], // Slightly softer magenta to match the dark theme
	'primary-content': purple[50], // Lighter for contrast
	secondary: red[700], // Softened red
	'secondary-content': red[100], // Softer light red for readability
	accent: green[400], // Muted green to harmonize with dark accent
	'accent-content': green[50], // Softened green content
	neutral: grey[50], // Lightened neutral for consistency
	'neutral-content': grey[900], // Dark content for neutral contrast
	'base-100': grey[50], // Clean white for base
	'base-200': grey[100],
	'base-300': grey[200],
	'base-content': grey[900], // Darker content for contrast
	info: blue[400], // Softer blue for less harsh info
	'info-content': blue[50], // Softer light blue for content
	success: green[500], // Softer green for success
	'success-content': green[50], // Lighter content for contrast
	warning: orange[600], // Harmonized with dark theme
	'warning-content': orange[50], // Light beige for contrast
	error: red[500], // Softer red for light theme
	'error-content': red[50], // Lightened for contrast
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
