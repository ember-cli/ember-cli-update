'use strict';

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020
  },
  env: {
    es6: true
  },
  extends: [
    'sane-node'
  ],
  overrides: [
    {
      files: ['bin/**/*.js'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: [
        'test/**/*-test.js'
      ],
      env: {
        mocha: true
      },
      plugins: [
        'mocha'
      ],
      extends: [
        'plugin:mocha/recommended'
      ],
      rules: {
        'mocha/no-exclusive-tests': 'error',
        'mocha/no-empty-description': 'off',
        'mocha/no-setup-in-describe': 'off',
        'mocha/no-hooks-for-single-case': 'off'
      }
    }
  ]
};
