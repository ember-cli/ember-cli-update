'use strict';

const _getTagVersion = require('boilerplate-update/src/get-tag-version');

module.exports = function getTagVersion(versions, projectType) {
  let packageName;
  switch (projectType) {
    case 'app':
    case 'addon':
      packageName = 'ember-cli';
      break;
    case 'glimmer':
      packageName = '@glimmer/blueprint';
      break;
  }

  return function getTagVersion(range) {
    return _getTagVersion({
      range,
      versions,
      packageName,
      distTags: [
        'latest',
        'beta'
      ]
    });
  };
};
