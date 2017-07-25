'use strict';

const getPackageVersion = require('./get-package-version');
const getProjectVersion = require('./get-project-version');
const getTagVersion = require('./get-tag-version');
const getProjectType = require('./get-project-type');
const gitDiffApply = require('git-diff-apply');
const debug = require('debug')('ember-cli-update');

module.exports = function emberCliUpdate(options) {
  let endTag = options.endTag;

  let packageVersion = getPackageVersion('.');
  let projectVersion = getProjectVersion(packageVersion);

  let startTag = projectVersion;

  if (!endTag) {
    endTag = getTagVersion('latest');
  }

  let projectType = getProjectType('.');

  let projectKeyword = projectType === 'app' ? 'new' : 'addon';

  let remoteName = `ember-${projectKeyword}-output`;
  let remoteUrl = `https://github.com/ember-cli/${remoteName}`;

  gitDiffApply({
    remoteName,
    remoteUrl,
    startTag,
    endTag
  });
};
