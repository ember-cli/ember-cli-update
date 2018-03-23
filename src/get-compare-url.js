'use strict';

module.exports = function getCompareUrl(options) {
  let remoteUrl = options.remoteUrl;
  let startTag = options.startTag;
  let endTag = options.endTag;

  return `${remoteUrl}/compare/${startTag}...${endTag}`;
};
