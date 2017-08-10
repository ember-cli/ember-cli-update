'use strict';

const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const getTagVersion = require('./get-tag-version');
const getProjectType = require('./get-project-type');
const gitDiffApply = require('git-diff-apply');
const run = require('./run');

module.exports = function emberCliUpdate(options) {
  let to = options.to;

  let versions = JSON.parse(
    run('npm info ember-cli versions --json')
  );

  let packageVersion = getPackageVersion('.');
  let projectVersion = getProjectVersion(packageVersion, versions);

  let startTag = projectVersion;

  let endTag = getTagVersion(to, versions);

  let projectType = getProjectType('.');

  let projectKeyword = projectType === 'app' ? 'new' : 'addon';

  let remoteUrl = `https://github.com/ember-cli/ember-${projectKeyword}-output`;

  return gitDiffApply({
    remoteUrl,
    startTag,
    endTag
  });
};
