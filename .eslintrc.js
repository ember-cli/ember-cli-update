module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  plugins: [
    'node'
  ],
  extends: [
    'sane',
    'plugin:node/recommended'
  ],
  env: {
    es6: true,
    node: true
  },
  rules: {
  },
  overrides: [
    {
      files: ['bin/*.js'],
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
