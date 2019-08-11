module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: [
    'sane-node'
  ],
  env: {
    es6: true
  },
  rules: {
    // https://github.com/eslint/eslint/issues/11899
    'require-atomic-updates': 'off'
  },
  overrides: [
    {
      files: ['bin/**/*.js'],
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['test/**/*-test.js'],
      plugins: [
        'mocha'
      ],
      extends: [
        'plugin:mocha/recommended'
      ],
      env: {
        mocha: true
      },
      rules: {
        'mocha/no-setup-in-describe': 'off',
        'mocha/no-hooks-for-single-case': 'off'
      }
    }
  ]
};
