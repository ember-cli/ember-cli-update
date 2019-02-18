'use strict';

module.exports = function getRemoteUrl(projectOptions) {
  let org;
  let project;

  if (projectOptions.includes('app')) {
    org = 'ember-cli';
    project = 'ember-new-output';
  } else if (projectOptions.includes('addon')) {
    org = 'ember-cli';
    project = 'ember-addon-output';
  } else if (projectOptions.includes('glimmer')) {
    org = 'glimmerjs';
    project = 'glimmer-blueprint-output';
  }

  return `https://github.com/${org}/${project}`;
};
