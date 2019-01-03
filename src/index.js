'use strict';

const fs = require('fs');
const getPackageJson = require('./get-package-json');
const getProjectType = require('./get-project-type');
const getPackageVersion = require('./get-package-version');
const getVersions = require('./get-versions');
const getProjectVersion = require('./get-project-version');
const _getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const compareVersions = require('./compare-versions');
const formatStats = require('./format-stats');
const getCodemods = require('boilerplate-update/src/get-codemods');
const getApplicableCodemods = require('boilerplate-update/src/get-applicable-codemods');
const promptAndRunCodemods = require('boilerplate-update/src/prompt-and-run-codemods');
const mergePackageJson = require('merge-package.json');
const gitDiffApply = require('git-diff-apply');
const run = require('./run');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const co = require('co');

const codemodsUrl = 'https://rawgit.com/ember-cli/ember-cli-update-codemods-manifest/v2/manifest.json';

module.exports = function emberCliUpdate({
  from,
  to,
  resolveConflicts,
  runCodemods: _runCodemods,
  reset,
  compareOnly,
  statsOnly,
  listCodemods,
  createCustomDiff
}) {
  return Promise.resolve().then(co.wrap(function*() {
    if (listCodemods) {
      return getCodemods(codemodsUrl).then(codemods => {
        return JSON.stringify(codemods, null, 2);
      });
    }

    let packageJson = getPackageJson('.');
    let projectType = getProjectType(packageJson);
    let packageVersion = getPackageVersion(packageJson, projectType);
    let versions = getVersions(projectType);
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

    if (_runCodemods) {
      return promptAndRunCodemods({
        url: codemodsUrl,
        projectType,
        startVersion
      });
    }

    let startCommand;
    let endCommand;

    return Promise.resolve().then(() => {
      if (createCustomDiff) {
        return getStartAndEndCommands({
          projectName: packageJson.name,
          projectType,
          startVersion,
          endVersion
        }).then(commands => {
          startCommand = commands.startCommand;
          endCommand = commands.endCommand;
        });
      }
    }).then(() => {
      let ignoredFiles;
      if (!reset) {
        ignoredFiles = ['package.json'];
      } else {
        ignoredFiles = [];
      }

      return gitDiffApply({
        remoteUrl,
        startTag,
        endTag,
        resolveConflicts,
        ignoredFiles,
        reset,
        createCustomDiff,
        startCommand,
        endCommand
      }).then(results => {
        if (reset) {
          return;
        }

        let myPackageJson = fs.readFileSync('package.json', 'utf8');
        let fromPackageJson = results.from['package.json'];
        let toPackageJson = results.to['package.json'];

        let newPackageJson = mergePackageJson(myPackageJson, fromPackageJson, toPackageJson);

        fs.writeFileSync('package.json', newPackageJson);

        run('git add package.json');
      });
    });
  }));
};
