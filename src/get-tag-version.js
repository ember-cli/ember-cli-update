'use strict';

const _getTagVersion = require('boilerplate-update/src/get-tag-version');

module.exports = function getTagVersion(versions, packageName) {
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
