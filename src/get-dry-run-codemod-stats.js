'use strict';

module.exports = function getDryRunCodemodStats(codemods) {
  codemods = Object.keys(codemods).join(', ');

  return Promise.resolve(
    `Would run the following codemods: ${codemods}.`
  );
};
