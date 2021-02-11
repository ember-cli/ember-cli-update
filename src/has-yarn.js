const path = require('path');
const fs = require('fs-extra');

/**
 * Check if there is a yarn.lock file to indicate if the project uses yarn as the package manager
 *
 * @param {string} projectRoot - Path to the project root to check for yarn usage
 * @returns {Promise<boolean>}
 */
module.exports = async function hasYarn(projectRoot) {
  let isYarn = false;
  try {
    await fs.access(path.join(projectRoot, 'yarn.lock'), fs.constants.F_OK);
    isYarn = true;
  } catch (err) {}
  return isYarn;
};
