'use strict';

const bootstrap = require('../../src/bootstrap');

module.exports.command = 'bootstrap';

module.exports.describe = 'saves the detected blueprint state';

module.exports.handler = async function handler() {
  try {
    await bootstrap();
  } catch (err) {
    console.error(err);
  }
};
