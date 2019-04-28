'use strict';

const cp = require('child_process');
const denodeify = require('denodeify');
const debug = require('debug')('ember-cli-update');

module.exports = async function run(command, options) {
  debug(command);
  let result = (await denodeify(cp.exec)(command, options)).toString();
  debug(result);
  return result;
};
