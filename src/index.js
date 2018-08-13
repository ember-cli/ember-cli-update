'use strict';

const fs = require('fs');
const getProjectType = require('./get-project-type');
const getPackageVersion = require('./get-package-version');
const getVersions = require('./get-versions');
const getProjectVersion = require('./get-project-version');
const getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const compareVersions = require('./compare-versions');
const getDryRunStats = require('./get-dry-run-stats');
const getDryRunCodemodStats = require('./get-dry-run-codemod-stats');
const getApplicableCodemods = require('./get-applicable-codemods');
const runCodemods = require('./run-codemods');
const mergePackageJson = require('merge-package.json');
const gitDiffApply = require('git-diff-apply');
const run = require('./run');
const utils = require('./utils');

module.exports = function emberCliUpdate(options) {
  let from = options.from;
  let to = options.to;
  let resolveConflicts = options.resolveConflicts;
  let _runCodemods = options.runCodemods;
  let reset = options.reset;
  let compareOnly = options.compareOnly;
  let dryRun = options.dryRun;
  let listCodemods = options.listCodemods;

  return Promise.resolve().then(() => {
    if (listCodemods) {
      return utils.getCodemods().then(codemods => {
        return JSON.stringify(codemods, null, 2);
      });
    }

    let projectType = getProjectType('.');
    let packageVersion = getPackageVersion('.', projectType);
    let versions = getVersions(projectType);

    let startVersion;
    if (from) {
      startVersion = getTagVersion(from, versions, projectType);
    } else {
      startVersion = getProjectVersion(packageVersion, versions, projectType);
    }

    let endVersion = getTagVersion(to, versions, projectType);

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

    if (_runCodemods) {
      return getApplicableCodemods({
        projectType,
        startVersion
      }).then(codemods => {
        if (dryRun) {
          return getDryRunCodemodStats(codemods);
        }

        return runCodemods(codemods);
      });
    }

    if (dryRun) {
      return getDryRunStats({
        startVersion,
        endVersion
      });
    }

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
      reset
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
};
