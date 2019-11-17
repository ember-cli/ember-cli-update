'use strict';

const args = require('../../src/args');
const emberCliUpdate = require('../../src');

module.exports.command = '$0';

module.exports.builder = args;

module.exports.handler = async function handler(argv) {
  let blueprint = argv['blueprint'];
  let from = argv['from'];
  let to = argv['to'];
  let resolveConflicts = argv['resolve-conflicts'];
  let runCodemods = argv['run-codemods'];
  let codemodsJson = argv['codemods-json'];
  let reset = argv['reset'];
  let compareOnly = argv['compare-only'];
  let statsOnly = argv['stats-only'];
  let listCodemods = argv['list-codemods'];
  let createCustomDiff = argv['create-custom-diff'];

  try {
    let message = await emberCliUpdate({
      blueprint,
      from,
      to,
      resolveConflicts,
      runCodemods,
      codemodsJson,
      reset,
      compareOnly,
      statsOnly,
      listCodemods,
      createCustomDiff,
      wasRunAsExecutable: true
    });
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
};
