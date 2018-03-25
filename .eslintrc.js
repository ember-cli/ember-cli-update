module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017
  },
  plugins: [
    'node',
    'mocha'
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
    'mocha/no-exclusive-tests': 'error'
  }
};
