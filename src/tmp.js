'use strict';

const { promisify } = require('util');
const createTmpDir = promisify(require('tmp').dir);

module.exports = {
  createTmpDir
};
