'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const getRemoteUrl = require('../../src/get-remote-url');

describe(getRemoteUrl, function() {
  it('gets remote url for ember app', function() {
    expect(getRemoteUrl(['app'])).to.equal(
      'https://github.com/ember-cli/ember-new-output'
    );
  });

  it('gets remote url for ember addon', function() {
    expect(getRemoteUrl(['addon'])).to.equal(
      'https://github.com/ember-cli/ember-addon-output'
    );
  });

  it('gets remote url for glimmer app', function() {
    expect(getRemoteUrl(['glimmer'])).to.equal(
      'https://github.com/glimmerjs/glimmer-blueprint-output'
    );
  });
});
