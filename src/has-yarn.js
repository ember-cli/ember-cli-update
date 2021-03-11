'use strict';

const path = require('path');
const fs = require('fs-extra');

/**
 * Check if there is a yarn.lock file to indicate if the project uses yarn as the package manager
 *
 * @param {string} projectRoot - Path to the project root to check for yarn usage
 * @returns {boolean}
 */
module.exports = async function hasYarn(projectRoot) {
  try {
    await fs.access(path.join(projectRoot, 'yarn.lock'), fs.constants.F_OK);
    return true;
  } catch (err) {}
  return false;
};
