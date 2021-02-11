'use strict';

const path = require('path');
const fs = require('fs-extra');

/**
 * Check if there is a yarn.lock file to indicate if the project uses yarn as the package manager
 *
 * @param {string} projectRoot - Path to the project root to check for yarn usage
 * @returns {boolean}
 */
module.exports = function hasYarn(projectRoot) {
  let isYarn = false;
  try {
    fs.accessSync(path.join(projectRoot, 'yarn.lock'), fs.constants.F_OK);
    isYarn = true;
  } catch (err) {}
  return isYarn;
};
