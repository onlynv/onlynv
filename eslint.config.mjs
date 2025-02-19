import js from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	{
		plugins: {},
		rules: {
			quotes: [
				'error',
				'single',
				{
					avoidEscape: true
				}
			],
			semi: ['error', 'always'],
			'require-await': 'off',
			'object-curly-spacing': ['error', 'always'],
			'array-bracket-spacing': ['error', 'never'],
			'comma-dangle': ['error', 'never'],
			'no-unneeded-ternary': [
				'error',
				{
					defaultAssignment: false
				}
			],
			'prefer-const': 'error',
			'prefer-spread': 'error',
			'no-unsafe-optional-chaining': 'error'
		}
	}
];
