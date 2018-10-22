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
  let tmpPath;
  if (process.env.AGENT_TEMPDIRECTORY) {
    console.log("Detected Azure Pipelines, using agent temp dir");
    tmpPath = tmp.dirSync({ dir: process.env.AGENT_TEMPDIRECTORY }).name;
  } else {
    console.log("Not using Azure Pipelines...");
    tmpPath = tmp.dirSync().name;
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
