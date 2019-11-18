'use strict';

function loadSafeDefaultBlueprint(projectOptions = [], version) {
  let type = 'app';
  if (projectOptions.includes('addon')) {
    type = 'addon';
  }

  let options = [];
  if (projectOptions.includes('yarn')) {
    options.push('--yarn');
  }
  if (!projectOptions.includes('welcome') || projectOptions.includes('addon')) {
    // Why do addons always have --no-welcome?
    options.push('--no-welcome');
  }

  return {
    packageName: 'ember-cli',
    name: 'ember-cli',
    type,
    version,
    options,
    isBaseBlueprint: true
  };
}

module.exports = loadSafeDefaultBlueprint;
