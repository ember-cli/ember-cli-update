'use strict';

const run = require('./run');
const getRemoteUrl = require('./get-remote-url');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprint = require('./parse-blueprint');
const downloadBlueprint = require('./download-blueprint');
const saveBlueprint = require('./save-blueprint');

module.exports = async function init({
  blueprint,
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
  if (blueprint) {
    parsedBlueprint = await parseBlueprint(blueprint);
  } else {
    parsedBlueprint = defaultBlueprint;
  }
  parseBlueprint.version = to;

  let downloadedBlueprint = await downloadBlueprint(parsedBlueprint.name, parsedBlueprint.url, parseBlueprint.version);

  let result = await (await boilerplateUpdate({
    projectOptions: ['blueprint'],
    remoteUrl: ({ projectOptions }) => getRemoteUrl(projectOptions),
    endVersion: downloadedBlueprint.version,
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
      endBlueprint: downloadedBlueprint
    }),
    ignoredFiles: ['ember-cli-update.json'],
    wasRunAsExecutable
  })).promise;

  await saveBlueprint({
    cwd,
    name: downloadedBlueprint.name,
    location: parsedBlueprint.location,
    version: downloadedBlueprint.version
  });

  await run('git add ember-cli-update.json');

  return result;
};
