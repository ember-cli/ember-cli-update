'use strict';

const path = require('path');
const _getTagVersion = require('boilerplate-update/src/get-tag-version');
const utils = require('./utils');

module.exports = function getTagVersion(versions, packageName, blueprintUrl) {
  return async function getTagVersion(range) {
    if (blueprintUrl) {
      let blueprint = await utils.downloadBlueprint(packageName, blueprintUrl, range);
      // let result = await run('npm version', { cwd: blueprint.path });
      // return eval(`(${result})`)[blueprint.name];
      return require(path.join(blueprint.path, 'package')).version;
    }

    return await _getTagVersion({
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
