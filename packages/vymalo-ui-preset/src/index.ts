import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss/types/config';
import { colord } from 'colord';
import {
	blue,
	green,
	grey,
	orange,
	purple,
	red,
	teal,
} from '@mui/material/colors';

const mainColor = purple;

const coreVymaloTheme = {
	primary: mainColor[500],
	'primary-content': mainColor[50],
	secondary: teal[400],
	'secondary-content': teal[100],
	accent: green[500],
	'accent-content': green[50],
	neutral: grey[900],
	'neutral-content': grey[800],
	'base-100': colord(mainColor[900]).darken(0.2).desaturate(0.45).toHex(),
	'base-200': colord(mainColor[900]).darken(0.215).desaturate(0.47).toHex(),
	'base-300': colord(mainColor[900]).darken(0.23).desaturate(0.5).toHex(),
	'base-content': colord(mainColor[50]).lighten(0.05).toHex(),
	info: blue[700],
	'info-content': blue[50],
	success: green[600],
	'success-content': green[50],
	warning: orange[800],
	'warning-content': orange[100],
	error: red[800],
	'error-content': red[50],
};

const lightVymaloTheme = {
	primary: mainColor[400],
	'primary-content': mainColor[50],
	secondary: teal[700],
	'secondary-content': teal[100],
	accent: green[400],
	'accent-content': green[50],
	neutral: grey[50],
	'neutral-content': grey[900],
	'base-100': colord(mainColor[50]).lighten(0.04).desaturate(0.3).toHex(),
	'base-200': colord(mainColor[50]).lighten(0.02).desaturate(0.4).toHex(),
	'base-300': colord(mainColor[50]).lighten(0.01).desaturate(0.5).toHex(),
	'base-content': mainColor[900],
	info: blue[400],
	'info-content': blue[50],
	success: green[500],
	'success-content': green[50],
	warning: orange[600],
	'warning-content': orange[50],
	error: red[500],
	'error-content': red[50],
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
