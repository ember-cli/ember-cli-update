'use strict';

const isDefaultBlueprint = require('./is-default-blueprint');
const hasYarn = require('./has-yarn');

/**
 * Determine if project is a `addon`, `app`, or `glimmer` type
 *
 * @param {function} checkForDep - Function that will check if dependency exists in `devDependencies` or `dependencies`
 * attribute of `package.json`
 * @param {array} keywords - Array of strings of the `keywords` attribute from `package.json`
 * @returns {string}
 */
function getProjectType(checkForDep, keywords) {
  let isAddon = keywords && keywords.indexOf('ember-addon') !== -1;

  if (isAddon) {
    return 'addon';
  }

  let isGlimmer = checkForDep('@glimmer/blueprint');

  if (isGlimmer) {
    return 'glimmer';
  }

  let isApp = checkForDep('ember-cli');

  if (isApp) {
    return 'app';
  }

  throw new Error('Ember CLI project type could not be determined');
}

/**
 * Determine what kind of ember flavor this project is and if it uses yarn or npm
 *
 * @param {array} keywords - the `keywords` attribute from a `package.json`
 * @param {object} dependencies - the `dependencies` attribute from a `package.json`
 * @param {object} devDependencies - the `devDependencies` attribute  from a `package.json`
 * @param {object} blueprint - Expected to contain `packageName` and `name`
 * @returns {Promise<[string]|string[]>} - Array of strings containing keywords
 */
module.exports = async function getProjectOptions({
  keywords,
  dependencies,
  devDependencies
}, blueprint) {
  if (blueprint && !isDefaultBlueprint(blueprint)) {
    return ['blueprint'];
  }

  let allDeps = Object.assign({}, dependencies, devDependencies);

  function checkForDep(packageName) {
    return allDeps[packageName] !== undefined;
  }

  let projectType = getProjectType(checkForDep, keywords);

  let options = [projectType];

  let cwd = process.cwd();

  let isYarn = await hasYarn(cwd);

  if (isYarn) {
    options.push('yarn');
  }

  // addons don't support the welcome option
  if (projectType === 'app') {
    let hasWelcome = checkForDep('ember-welcome-page');

    if (hasWelcome) {
      options.push('welcome');
    }
  }

  return options;
};
