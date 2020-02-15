'use strict';

function loadSafeBlueprint(blueprint) {
  blueprint = {
    ...blueprint
  };
  if (!blueprint.options) {
    blueprint.options = [];
  }
  return blueprint;
}

module.exports = loadSafeBlueprint;
