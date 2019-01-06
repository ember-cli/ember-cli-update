'use strict';

const getPackageJson = require('boilerplate-update/src/get-package-json');
const getProjectType = require('./get-project-type');
const getPackageVersion = require('./get-package-version');
const getVersions = require('./get-versions');
const getProjectVersion = require('./get-project-version');
const _getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const compareVersions = require('./compare-versions');
const formatStats = require('./format-stats');
const listCodemods = require('boilerplate-update/src/list-codemods');
const getApplicableCodemods = require('boilerplate-update/src/get-applicable-codemods');
const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const co = require('co');

const codemodsUrl = 'https://rawgit.com/ember-cli/ember-cli-update-codemods-manifest/v2/manifest.json';

module.exports = function emberCliUpdate({
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
  return Promise.resolve().then(co.wrap(function*() {
    if (_listCodemods) {
      return listCodemods(codemodsUrl);
    }

    let packageJson = yield getPackageJson('.');
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

    let startTag = `v${startVersion}`;
    let endTag = `v${endVersion}`;

    if (compareOnly) {
      return compareVersions({
        remoteUrl,
        startTag,
        endTag
      });
    }

    if (statsOnly) {
      return getApplicableCodemods({
        url: codemodsUrl,
        projectType,
        startVersion
      }).then(codemods => {
        return formatStats({
          projectType,
          startVersion,
          endVersion,
          remoteUrl,
          codemods
        });
      });
    }

    let customDiffOptions;
    if (createCustomDiff) {
      customDiffOptions = getStartAndEndCommands({
        projectName: packageJson.name,
        projectType,
        startVersion,
        endVersion
      });
    }

    return boilerplateUpdate({
      remoteUrl,
      startTag,
      endTag,
      resolveConflicts,
      reset,
      runCodemods,
      codemodsUrl,
      projectType,
      startVersion,
      createCustomDiff,
      customDiffOptions
    });
  }));
};
