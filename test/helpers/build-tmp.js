'use strict';

const path = require('path');
const fs = require('fs-extra');
const tmp = require('tmp');
const {
  gitInit,
  commit,
  postCommit
} = require('git-fixtures');
const run = require('../../src/run');

module.exports = function({
  fixturesPath,
  commitMessage,
  dirty,
  subDir = '',
  npmInstall
}) {
  if (process.env.BUILD_BINARIESDIRECTORY) {
    console.log("Detected Azure Pipelines, using Build.BinariesDirectory");
    let tmpPath = tmp.dirSync({ dir: process.env.BUILD_BINARIESDIRECTORY }).name;
  } else {
    console.log("Not using Azure Pipelines...");
    let tmpPath = tmp.dirSync().name;
  }

  gitInit({
    cwd: tmpPath
  });

  let tmpSubPath = path.join(tmpPath, subDir);

  fs.ensureDirSync(tmpSubPath);

  fs.copySync(fixturesPath, tmpSubPath);

  if (npmInstall) {
    run('npm install ember-cli --no-save', {
      cwd: tmpSubPath
    });
  }

  commit({
    m: commitMessage,
    cwd: tmpPath
  });

  postCommit({
    cwd: tmpPath,
    dirty
  });

  return tmpSubPath;
};
