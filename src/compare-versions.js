'use strict';

const utils = require('./utils');

module.exports = function compareVersions(options) {
  let remoteUrl = options.remoteUrl;
  let startTag = options.startTag;
  let endTag = options.endTag;

  let compareUrl = `${remoteUrl}/compare/${startTag}...${endTag}`;

  // even though this returns a promise, we don't want to use
  // it because it blocks the process
  // we want to open the browser and exit
  utils.opn(compareUrl, {
    // this means it no longer returns a promise
    wait: false
  });

  return Promise.resolve();
};
