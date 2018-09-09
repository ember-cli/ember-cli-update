'use strict';

module.exports = function formatStats({
  projectType,
  startVersion,
  endVersion,
  remoteUrl,
  codemods
}) {
  return [
    `project type: ${projectType}`,
    `from version: ${startVersion}`,
    `to version: ${endVersion}`,
    `output repo: ${remoteUrl}`,
    `applicable codemods: ${Object.keys(codemods).join(', ')}`
  ].join('\n');
};
