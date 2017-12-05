module.exports = {
  'from': {
    type: 'string',
    description: 'Use a starting version that is different than what is in your package.json ("2.9.1")'
  },
  'to': {
    type: 'string',
    default: 'latest',
    description: 'Update to a version that isn\'t latest ("2.14.1", "~2.15", "latest", "beta")'
  },
  'ignore-conflicts': {
    type: 'boolean',
    default: false,
    description: 'Handle merge conflicts yourself'
  },
  'run-codemods': {
    type: 'boolean',
    default: false,
    description: 'Run codemods to help update your code'
  }
};
