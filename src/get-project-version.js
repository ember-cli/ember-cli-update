'use strict';

const run = require('./run');

module.exports = function getProjectVersion(packageVersion) {
  let output = run(`npm info ember-cli@${packageVersion} version`);

  let lines = output.split(/\r?\n/).filter(Boolean);

  let startTag = lines.map(line => {
    let version = line.split(' ').pop().replace(/'/g, '');
    return `v${version}`;
  }).pop();

  return startTag;

  // let versions = JSON.parse(
  //   run(`npm info ember-cli@${packageVersion} version --json`)
  // );

  // return `v${versions.pop()}`;
};
