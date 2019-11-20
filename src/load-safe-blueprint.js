'use strict';

const Blueprint = require('./blueprint');

function loadSafeBlueprint(blueprint) {
  let _blueprint = new Blueprint();

  return {
    ..._blueprint,
    ...blueprint
  };
}

module.exports = loadSafeBlueprint;
