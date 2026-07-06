import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-n';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      n: nodePlugin,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'n/no-missing-import': 'off',
    },
  },
  prettierConfig,
  {
    // CLI scripts (seed.mjs and friends) are meant to print progress to
    // stdout -- console.log is the correct tool there, unlike in
    // request-handling code where the shared logger (utils/logger.js)
    // is used instead.
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'coverage/'],
  },
];
