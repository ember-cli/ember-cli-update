'use strict';

module.exports = {
  'blueprint': {
    alias: ['b'],
    type: 'string',
    description: 'Provide a custom blueprint for use in the update ("@glimmer/blueprint", "git+https://git@github.com/tildeio/libkit.git", "../blueprint")'
  },
  'from': {
    type: 'string',
    description: 'Use a starting version that is different than what is in your package.json ("2.9.1")'
  },
  'to': {
    type: 'string',
    description: 'Update to a version that isn\'t latest ("2.14.1", "~2.15", "latest", "beta")'
  },
  'resolve-conflicts': {
    type: 'boolean',
    default: false,
    description: 'Automatically run git mergetool if conflicts found'
  },
  'run-codemods': {
    type: 'boolean',
    default: false,
    description: 'Run codemods to help update your code'
  },
  'codemods-source': {
    type: 'string',
    description: 'Supply your own codemods manifest via URL ("ember-app-codemods-manifest@*", "git+https://github.com/ember-cli/ember-app-codemods-manifest.git#semver:*")'
  },
  'codemods-json': {
    type: 'string',
    description: 'Supply your own codemods manifest via JSON (`{ /* json */ }`)'
  },
  'reset': {
    type: 'boolean',
    default: false,
    description: 'Reset your code to the default blueprint at the new version'
  },
  'compare-only': {
    type: 'boolean',
    default: false,
    description: 'Show the changes between different versions without updating'
  },
  'stats-only': {
    type: 'boolean',
    default: false,
    description: 'Show all calculated values regarding your project'
  },
  'list-codemods': {
    type: 'boolean',
    default: false,
    description: 'List available codemods'
  },
  'create-custom-diff': {
    alias: ['ccd'],
    type: 'boolean',
    default: false,
    description: 'Create a personal diff using system .ember-cli'
  }
};
