module.exports = {
  'dist-tag': {
    type: 'string',
    default: 'latest',
    description: 'Update via dist-tag ("latest", "beta", etc...)'
  },
  'version': {
    alias: ['v'],
    type: 'string',
    description: 'Update to a version that isn\'t latest'
  }
};
