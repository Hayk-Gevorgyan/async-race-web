import js from '@eslint/js'
import globals from 'globals'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { FlatCompat } from '@eslint/eslintrc'
import { fixupConfigRules } from '@eslint/compat'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: __dirname })

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...fixupConfigRules(compat.extends('airbnb', 'airbnb/hooks')),
      ...tseslint.configs.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript handles these better than import plugin
      'no-use-before-define': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      // Named exports are intentional throughout this codebase
      'import/prefer-default-export': 'off',
      // json-server API convention: _page, _limit, _sort, _order
      'no-underscore-dangle': ['error', { allow: ['_page', '_limit', '_sort', '_order'] }],
      // Line length — allow up to 120
      'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
      // React 17+ JSX transform — no React import needed in every file
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // Allow .tsx for JSX
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      // TypeScript already enforces these
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      // {...car} spread on components is intentional
      'react/jsx-props-no-spreading': 'off',
      // We use React.memo with named function expressions, not arrow functions
      'react/function-component-definition': 'off',
      // Files intentionally export both components and helpers (e.g. GarageHeader + BRANDS/MODELS)
      'react-refresh/only-export-components': 'off',
      // Refs are intentional — known React pattern
      'react-hooks/exhaustive-deps': 'warn',
      // Barrel files re-exporting a default import must use this form
      'no-restricted-exports': 'off',
    },
  },
])
