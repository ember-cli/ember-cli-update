'use strict';

const fs = require('fs');
const getPackageJson = require('./get-package-json');
const getProjectType = require('./get-project-type');
const getPackageVersion = require('./get-package-version');
const getVersions = require('./get-versions');
const getProjectVersion = require('./get-project-version');
const getTagVersion = require('./get-tag-version');
const getRemoteUrl = require('./get-remote-url');
const compareVersions = require('./compare-versions');
const formatStats = require('./format-stats');
const getApplicableCodemods = require('./get-applicable-codemods');
const runCodemods = require('./run-codemods');
const mergePackageJson = require('merge-package.json');
const gitDiffApply = require('git-diff-apply');
const run = require('./run');
const utils = require('./utils');
const getStartAndEndCommands = require('./get-start-and-end-commands');

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
  return Promise.resolve().then(() => {
    if (listCodemods) {
      return utils.getCodemods().then(codemods => {
        return JSON.stringify(codemods, null, 2);
      });
    }

    let packageJson = getPackageJson('.');
    let projectType = getProjectType(packageJson);
    let packageVersion = getPackageVersion(packageJson, projectType);
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

    if (statsOnly) {
      return getApplicableCodemods({
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
      return getApplicableCodemods({
        projectType,
        startVersion
      }).then(codemods => {
        const inquirer = require('inquirer');

        return inquirer.prompt([{
          type: 'checkbox',
          message: 'These codemods apply to your project. Select which one\'s to run.',
          name: 'codemods',
          choices: Object.keys(codemods)
        }]).then(answers => {
          return runCodemods(answers.codemods.map(codemod => codemods[codemod]));
        });
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
  });
};
