'use strict';

function loadSafeBlueprint(blueprint) {
  return {
    options: [],
    ...blueprint
  };
}

module.exports = loadSafeBlueprint;
