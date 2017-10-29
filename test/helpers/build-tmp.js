'use strict';

const path = require('path');
const fs = require('fs-extra');
const gitFixtures = require('git-fixtures');

const gitInit = gitFixtures.gitInit;
const commit = gitFixtures.commit;
const postCommit = gitFixtures.postCommit;

module.exports = function(options) {
  let fixturesPath = options.fixturesPath;
  let tmpPath = options.tmpPath;
  let commitMessage = options.commitMessage;
  let dirty = options.dirty;
  let subDir = options.subDir || '';

  gitInit({
    cwd: tmpPath
  });

  let tmpSubPath = path.join(tmpPath, subDir);

  fs.ensureDirSync(tmpSubPath);

  fs.copySync(fixturesPath, tmpSubPath);

  commit({
    m: commitMessage,
    cwd: tmpPath
  });

  postCommit({
    cwd: tmpPath,
    dirty
  });
};
