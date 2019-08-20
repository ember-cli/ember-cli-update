'use strict';

const bootstrap = require('../../src/bootstrap');

module.exports.command = 'bootstrap';

module.exports.describe = 'saves the detected blueprint state';

module.exports.handler = async function handler() {
  try {
    let message = await bootstrap();
    if (message) {
      console.log(message);
    }
  } catch (err) {
    console.error(err);
  }
};
