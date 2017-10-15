'use strict';

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

  gitInit({
    cwd: tmpPath
  });

  fs.copySync(fixturesPath, tmpPath);

  commit({
    m: commitMessage,
    cwd: tmpPath
  });

  postCommit({
    cwd: tmpPath,
    dirty
  });
};
