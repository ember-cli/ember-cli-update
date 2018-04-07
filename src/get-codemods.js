'use strict';

const https = require('https');

const url = 'https://rawgit.com/ember-cli/ember-cli-update-codemods-manifest/v1/manifest.json';

module.exports = function getCodemods() {
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
