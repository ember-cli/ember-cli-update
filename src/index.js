'use strict';

const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork;
const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const getTagVersion = require('./get-tag-version');
const getProjectType = require('./get-project-type');
const autoMergePackageJson = require('./auto-merge-package-json');
const gitDiffApply = require('git-diff-apply');
const semver = require('semver');
const run = require('./run');

const modulesCodemodPath = path.join(__dirname, '../node_modules/ember-modules-codemod/bin/ember-modules-codemod');
const modulesCodemodVersion = '2.16.0-beta.1';

module.exports = function emberCliUpdate(options) {
  options = options || {};
  let from = options.from;
  let to = options.to;
  let ignoreConflicts = options.ignoreConflicts;

  let packageVersion = getPackageVersion('.');

  if (!packageVersion) {
    return Promise.reject('Ember CLI was not found in this project\'s package.json');
  }

  let versions = JSON.parse(
    run('npm info ember-cli versions --json')
  );

  let startVersion = from;
  if (!startVersion) {
    startVersion = getProjectVersion(packageVersion, versions);
  }

  let startTag = `v${startVersion}`;

  let endVersion = getTagVersion(to, versions);
  let endTag = `v${endVersion}`;

  let projectType = getProjectType('.');

  let projectKeyword = projectType === 'app' ? 'new' : 'addon';

  let remoteUrl = `https://github.com/ember-cli/ember-${projectKeyword}-output`;

  return gitDiffApply({
    remoteUrl,
    startTag,
    endTag,
    ignoreConflicts,
    ignoredFiles: ['package.json']
  }).then(results => {
    let myPackageJson = fs.readFileSync('package.json', 'utf8');
    let fromPackageJson = results.from['package.json'];
    let toPackageJson = results.to['package.json'];

    let newPackageJson = autoMergePackageJson(myPackageJson, fromPackageJson, toPackageJson);

    fs.writeFileSync('package.json', newPackageJson);

    run('git add package.json');

    if (semver.lt(startVersion, modulesCodemodVersion) && semver.gte(endVersion, modulesCodemodVersion)) {
      return new Promise(resolve => {
        let cp = fork(modulesCodemodPath);

        cp.on('exit', resolve);
      });
    }
  });
};
