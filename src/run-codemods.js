'use strict';

const semver = require('semver');
const debug = require('debug')('ember-cli-update');
const run = require('./run');
const utils = require('./utils');

const modulesCodemodVersion = '2.16.0-beta.1';

module.exports = function runCodemods(options) {
  let projectType = options.projectType;
  let startVersion = options.startVersion;

  let shouldRunModulesCodemod =
    semver.gte(startVersion, modulesCodemodVersion) &&
    projectType !== 'glimmer';

  if (shouldRunModulesCodemod) {
    debug('ember-modules-codemod');
    return utils.runEmberModulesCodemod().then(() => {
      run('git add -A');
    });
  }

  return Promise.resolve();
};
