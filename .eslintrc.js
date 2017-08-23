module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'mocha'
  ],
  extends: 'sane',
  env: {
    es6: true,
    node: true
  },
  rules: {
    'mocha/no-exclusive-tests': 'error'
  }
};
