'use strict';

function isDefaultBlueprint({ packageName, name }) {
  return packageName === 'ember-cli' && name === 'ember-cli';
}

module.exports = isDefaultBlueprint;
