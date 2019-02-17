'use strict';

const co = require('co');
const utils = require('./utils');
const getPackageJson = require('boilerplate-update/src/get-package-json');
const getProjectOptions = require('./get-project-options');
const getPackageName = require('./get-package-name');
const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const _getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const listCodemods = require('boilerplate-update/src/list-codemods');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');

const codemodsUrl = 'https://raw.githubusercontent.com/ember-cli/ember-cli-update-codemods-manifest/v3/manifest.json';

module.exports = co.wrap(function* emberCliUpdate({
  from,
  to,
  resolveConflicts,
  runCodemods,
  reset,
  compareOnly,
  statsOnly,
  listCodemods: _listCodemods,
  createCustomDiff,
  wasRunAsExecutable
}) {
  if (_listCodemods) {
    return yield listCodemods(codemodsUrl);
  }

  let packageJson = yield getPackageJson();
  let projectOptions = getProjectOptions(packageJson);
  let packageName = getPackageName(projectOptions);
  let packageVersion = getPackageVersion(packageJson, packageName);
  let versions = yield utils.getVersions(packageName);
  let getTagVersion = _getTagVersion(versions, packageName);

  let startVersion;
  if (from) {
    startVersion = yield getTagVersion(from);
  } else {
    startVersion = getProjectVersion(packageVersion, versions, projectOptions);
  }

  let endVersion = yield getTagVersion(to);

  let remoteUrl = getRemoteUrl(projectOptions);

  let customDiffOptions;
  if (createCustomDiff) {
    customDiffOptions = getStartAndEndCommands({
      projectName: packageJson.name,
      projectOptions,
      startVersion,
      endVersion
    });
  }

  return yield (yield boilerplateUpdate({
    remoteUrl,
    compareOnly,
    resolveConflicts,
    reset,
    statsOnly,
    runCodemods,
    codemodsUrl,
    packageJson,
    projectOptions,
    startVersion,
    endVersion,
    createCustomDiff,
    customDiffOptions,
    wasRunAsExecutable
  })).promise;
});
