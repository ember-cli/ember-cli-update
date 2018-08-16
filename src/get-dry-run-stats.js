'use strict';

module.exports = function getDryRunStats({
  startVersion,
  endVersion
}) {
  return Promise.resolve(
    `Would update from ${startVersion} to ${endVersion}.`
  );
};
