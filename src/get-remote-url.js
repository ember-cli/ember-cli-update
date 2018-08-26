'use strict';

module.exports = function getRemoteUrl(projectType) {
  let org;
  let project;

  switch (projectType) {
    case 'app':
      org = 'ember-cli';
      project = 'ember-new-output';
      break;
    case 'addon':
      org = 'ember-cli';
      project = 'ember-addon-output';
      break;
    case 'glimmer':
      org = 'glimmerjs';
      project = 'glimmer-blueprint-output';
      break;
  }

  return `~/code/${project}`;

  return `https://github.com/${org}/${project}`;
};
