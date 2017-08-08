'use strict';

const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const getTagVersion = require('./get-tag-version');
const getProjectType = require('./get-project-type');
const gitDiffApply = require('git-diff-apply');

module.exports = function emberCliUpdate(options) {
  let to = options.to;

  let packageVersion = getPackageVersion('.');
  let projectVersion = getProjectVersion(packageVersion);

  let startTag = projectVersion;

  let endTag = getTagVersion(to);

  let projectType = getProjectType('.');

  let projectKeyword = projectType === 'app' ? 'new' : 'addon';

  let remoteUrl = `https://github.com/ember-cli/ember-${projectKeyword}-output`;

  return gitDiffApply({
    remoteUrl,
    startTag,
    endTag
  });
};
