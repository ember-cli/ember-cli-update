'use strict';

const run = require('./run');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const saveBlueprint = require('./save-blueprint');

module.exports = async function init({
  blueprint: _blueprint,
  to,
  resolveConflicts,
  reset,
  wasRunAsExecutable
}) {
  let defaultBlueprint = {
    name: 'ember-cli'
  };

  let cwd = process.cwd();

  let parsedBlueprint;
  if (_blueprint) {
    parsedBlueprint = await parseBlueprint(_blueprint);
  } else {
    parsedBlueprint = defaultBlueprint;
  }

  let blueprint = await downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, to);

  let result = await (await boilerplateUpdate({
    projectOptions: ['blueprint'],
    endVersion: blueprint.version,
    resolveConflicts,
    reset,
    createCustomDiff: true,
    customDiffOptions: ({
      packageJson,
      projectOptions,
      endVersion
    }) => getStartAndEndCommands({
      packageJson,
      projectOptions,
      endVersion,
      endBlueprint: blueprint
    }),
    ignoredFiles: ['ember-cli-update.json'],
    wasRunAsExecutable
  })).promise;

  await saveBlueprint({
    cwd,
    name: blueprint.name,
    location: parsedBlueprint.location,
    version: blueprint.version
  });

  if (!reset) {
    await run('git add ember-cli-update.json');
  }

  return result;
};
