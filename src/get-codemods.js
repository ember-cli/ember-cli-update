'use strict';

const https = require('https');

const url = 'https://rawgit.com/ember-cli/ember-cli-update-codemods-manifest/v2/manifest.json';

module.exports = function getCodemods() {
  return Promise.resolve({
    "ember-modules-codemod": {
      "version": "2.16.0-beta.1",
      "projectTypes": ["app", "addon"],
      "nodeVersion": "4.0.0",
      "commands": ["/Users/kselden/code/ember-modules-codemod/bin/ember-modules-codemod.js"]
    },
    "ember-qunit-codemod": {
      "version": "3.0.0-beta.1",
      "projectTypes": ["app", "addon"],
      "nodeVersion": "4.0.0",
      "commands": ["/Users/kselden/code/jscodeshift/bin/jscodeshift.sh -t /Users/kselden/code/ember-qunit-codemod/ember-qunit-codemod.js ./tests/"]
    },
    "ember-test-helpers-codemod": {
      "version": "3.0.0-beta.1",
      "projectTypes": ["app", "addon"],
      "nodeVersion": "6.0.0",
      "commands": [
        "/Users/kselden/code/ember-test-helpers-codemod/bin/ember-test-helpers-codemod.js --type=integration tests/integration",
        "/Users/kselden/code/ember-test-helpers-codemod/bin/ember-test-helpers-codemod.js --type=acceptance tests/acceptance"
      ]
    },
    "es5-getter-ember-codemod": {
      "version": "3.1.0-beta.1",
      "projectTypes": ["app", "addon"],
      "nodeVersion": "4.0.0",
      "commands": ["/Users/kselden/code/jscodeshift/bin/jscodeshift.sh -t /Users/kselden/code/es5-getter-ember-codemod/es5-getter-ember-codemod.js ./app"]
    },
    "qunit-dom-codemod": {
      "version": "3.2.0-beta.1",
      "projectTypes": ["app", "addon"],
      "nodeVersion": "6.0.0",
      "commands": ["/Users/kselden/code/jscodeshift/bin/jscodeshift.sh -t /Users/kselden/code/qunit-dom-codemod/qunit-dom-codemod.js ./tests"]
    }
  });
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let manifest = '';
      res.on('data', d => {
        manifest += d;
      }).on('end', () => {
        resolve(JSON.parse(manifest));
      });
    }).on('error', reject);
  });
};
