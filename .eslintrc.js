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
      env: {
        mocha: true
      },
      rules: {
        'mocha/no-exclusive-tests': 'error'
      }
    }
  ]
};
