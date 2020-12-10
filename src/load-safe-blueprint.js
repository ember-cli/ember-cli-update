'use strict';

/**
 * Ensure the blueprint object has a `options` attribute that is an array
 *
 * @param {Object} blueprint - Normalize this object into one that has an `options` attribute
 * @returns Modified `blueprint` object with `options` attribute that is an array
 */
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
