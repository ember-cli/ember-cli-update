'use strict';

module.exports = function getRemoteUrl(projectType) {
  let project;

  switch (projectType) {
    case 'app':
      project = 'ember-new-output';
      break;
    case 'addon':
      project = 'ember-addon-output';
      break;
  }

  let remoteUrl = `https://github.com/ember-cli/${project}`;

  return remoteUrl;
};
