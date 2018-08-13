'use strict';

module.exports = function getDryRunStats(options) {
  let startVersion = options.startVersion;
  let endVersion = options.endVersion;

  return Promise.resolve(
    `Would update from ${startVersion} to ${endVersion}.`
  );
};
