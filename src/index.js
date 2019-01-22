'use strict';

const getPackageJson = require('boilerplate-update/src/get-package-json');
const getProjectType = require('./get-project-type');
const getPackageVersion = require('./get-package-version');
const getVersions = require('./get-versions');
const getProjectVersion = require('./get-project-version');
const _getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const listCodemods = require('boilerplate-update/src/list-codemods');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const co = require('co');

const codemodsUrl = 'https://rawgit.com/ember-cli/ember-cli-update-codemods-manifest/v2/manifest.json';

module.exports = co.wrap(function* emberCliUpdate({
  from,
  to,
  resolveConflicts,
  runCodemods,
  reset,
  compareOnly,
  statsOnly,
  listCodemods: _listCodemods,
  createCustomDiff
}) {
  if (_listCodemods) {
    return yield listCodemods(codemodsUrl);
  }

  let packageJson = yield getPackageJson();
  let projectType = getProjectType(packageJson);
  let packageVersion = getPackageVersion(packageJson, projectType);
  let versions = yield getVersions(projectType);
  let getTagVersion = _getTagVersion(versions, projectType);

  let startVersion;
  if (from) {
    startVersion = yield getTagVersion(from);
  } else {
    startVersion = getProjectVersion(packageVersion, versions, projectType);
  }

  let endVersion = yield getTagVersion(to);

  let remoteUrl = getRemoteUrl(projectType);

  let customDiffOptions;
  if (createCustomDiff) {
    customDiffOptions = getStartAndEndCommands({
      projectName: packageJson.name,
      projectType,
      startVersion,
      endVersion
    });
  }

  return yield boilerplateUpdate({
    remoteUrl,
    compareOnly,
    resolveConflicts,
    reset,
    statsOnly,
    runCodemods,
    codemodsUrl,
    projectType,
    startVersion,
    endVersion,
    createCustomDiff,
    customDiffOptions
  });
});
