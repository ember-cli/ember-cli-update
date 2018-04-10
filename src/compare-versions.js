'use strict';

const getCompareUrl = require('./get-compare-url');
const utils = require('./utils');

module.exports = function compareVersions(options) {
  let remoteUrl = options.remoteUrl;
  let startTag = options.startTag;
  let endTag = options.endTag;

  let compareUrl = getCompareUrl({
    remoteUrl,
    startTag,
    endTag
  });

  return utils.opn(compareUrl);
};
