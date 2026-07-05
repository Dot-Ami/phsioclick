import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // 'vendor' holds a prebuilt third-party package (react-muscle-highlighter);
  // its CJS dist output isn't our source and shouldn't be linted as ESM.
  globalIgnores(['dist', 'vendor']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Bridges JSX component-tag usage (e.g. `<Icon />`) into core
      // no-unused-vars scope analysis — without it, props/destructured
      // vars only ever referenced as a JSX tag are false-flagged as unused.
      'react/jsx-uses-vars': 'error',
    },
  },
])
