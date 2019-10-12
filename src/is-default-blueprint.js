'use strict';

function isDefaultBlueprint(blueprint) {
  return blueprint.name === 'ember-cli';
}

module.exports = isDefaultBlueprint;
