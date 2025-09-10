import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

import eslintConfigPrettier from 'eslint-config-prettier/flat';
import mochaPlugin from 'eslint-plugin-mocha';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node }
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  eslintConfigPrettier,
  mochaPlugin.configs.recommended,
  {
    rules: {
      // this is here because of the strange mocha-helpers helpers package. TODO remove mocha-helpers
      'mocha/no-top-level-hooks': 'off',
      'mocha/no-sibling-hooks': 'off',
      'mocha/consistent-spacing-between-blocks': 'off'
    }
  },
  {
    ignores: ['test/fixtures']
  }
]);
