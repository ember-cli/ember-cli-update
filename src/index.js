'use strict';

const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const getTagVersion = require('./get-tag-version');
const getProjectType = require('./get-project-type');
const gitDiffApply = require('git-diff-apply');
const run = require('./run');

module.exports = function emberCliUpdate(options) {
  let from = options.from;
  let to = options.to;
  let ignoreConflicts = options.ignoreConflicts;
  let packageJsonOnly = options.packageJsonOnly;

  let versions = JSON.parse(
    run('npm info ember-cli versions --json')
  );

  if (!from) {
    let packageVersion = getPackageVersion('.');
    from = getProjectVersion(packageVersion, versions);
  }

  let startTag = `v${from}`;

  let endTag = getTagVersion(to, versions);

  let projectType = getProjectType('.');

  let projectKeyword = projectType === 'app' ? 'new' : 'addon';

  let remoteUrl = `https://github.com/ember-cli/ember-${projectKeyword}-output`;

  if (packageJsonOnly) {
    const autoMergePackageJson = require('./auto-merge-package-json');
    return autoMergePackageJson(projectType, startTag, endTag);
  }

  return gitDiffApply({
    remoteUrl,
    startTag,
    endTag,
    ignoreConflicts
  });
};
