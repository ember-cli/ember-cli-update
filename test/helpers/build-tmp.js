'use strict';

const path = require('path');
const fs = require('fs-extra');
const {
  gitInit,
  commit,
  postCommit
} = require('git-fixtures');

module.exports = function({
  fixturesPath,
  tmpPath,
  commitMessage,
  dirty,
  subDir = ''
}) {
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
