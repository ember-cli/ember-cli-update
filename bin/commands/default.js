'use strict';

const args = require('../../src/args');
const emberCliUpdate = require('../../src');
const reset = require('../../src/reset');
const stats = require('../../src/stats');
const compare = require('../../src/compare');
const codemods = require('../../src/codemods');

module.exports.command = '$0';

module.exports.builder = args;

module.exports.handler = async function handler(argv) {
  try {
    let result;
    if (argv.reset) {
      result = await reset(argv);
    } else if (argv.statsOnly) {
      result = { promise: stats(argv) };
    } else if (argv.compareOnly) {
      result = { promise: compare(argv) };
    } else if (argv.listCodemods || argv.runCodemods) {
      result = {
        promise: codemods({
          ...argv,
          list: argv.listCodemods,
          sourceJson: argv.codemodsJson
        })
      };
    } else {
      result = await emberCliUpdate(argv);
    }

    let message = await result.promise;
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
};
