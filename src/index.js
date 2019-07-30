'use strict';

const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getVersions = require('boilerplate-update/src/get-versions');
const getProjectVersion = require('./get-project-version');
const _getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprint = require('./parse-blueprint');

module.exports = async function emberCliUpdate({
  blueprint,
  from,
  to,
  resolveConflicts,
  runCodemods,
  reset,
  compareOnly,
  statsOnly,
  listCodemods,
  createCustomDiff,
  wasRunAsExecutable
}) {
  if (blueprint) {
    if (!from) {
      throw new Error('A custom blueprint cannot detect --from. You must supply it.');
    }

    createCustomDiff = true;
  }

  return await (await boilerplateUpdate({
    projectOptions: ({ packageJson }) => getProjectOptions(packageJson, blueprint),
    mergeOptions: async function mergeOptions({
      packageJson,
      projectOptions
    }) {
      let packageName;
      let packageVersion;
      let versions;
      let parsedBlueprint;
      let blueprintUrl;

      if (blueprint) {
        parsedBlueprint = await parseBlueprint(blueprint);
        packageName = parsedBlueprint.name;
        blueprintUrl = parsedBlueprint.url;
        packageVersion = from;
      } else {
        packageName = getPackageName(projectOptions);
        packageVersion = getPackageVersion(packageJson, packageName);
      }

      if (!blueprintUrl) {
        versions = await getVersions(packageName);
      }

      let getTagVersion = _getTagVersion(versions, packageName, blueprintUrl);

      let startVersion;
      if (from) {
        startVersion = await getTagVersion(from);
      } else {
        startVersion = getProjectVersion(packageVersion, versions, projectOptions);
      }

      let endVersion = await getTagVersion(to);

      let customDiffOptions;
      if (createCustomDiff) {
        customDiffOptions = getStartAndEndCommands({
          packageJson,
          projectOptions,
          startVersion,
          endVersion,
          blueprint: parsedBlueprint
        });
      }

      return {
        startVersion,
        endVersion,
        customDiffOptions
      };
    },
    remoteUrl: ({ projectOptions }) => getRemoteUrl(projectOptions),
    compareOnly,
    resolveConflicts,
    reset,
    statsOnly,
    listCodemods,
    runCodemods,
    codemodsUrl: 'https://raw.githubusercontent.com/ember-cli/ember-cli-update-codemods-manifest/v3/manifest.json',
    createCustomDiff,
    wasRunAsExecutable
  })).promise;
};
