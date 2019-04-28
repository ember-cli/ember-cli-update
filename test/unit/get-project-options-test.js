'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const getProjectOptions = require('../../src/get-project-options');

describe(getProjectOptions, function() {
  let cwd;

  before(function() {
    cwd = process.cwd();
  });

  afterEach(function() {
    process.chdir(cwd);
  });

  it('throws if not found', async function() {
    let packageJson = {};

    await expect(getProjectOptions(packageJson))
      .to.eventually.be.rejectedWith('Ember CLI project type could not be determined');
  });

  it('detects ember app with ember-cli as a devDependency', async function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['app']);
  });

  it('detects ember app with ember-cli as a dependency', async function() {
    let packageJson = {
      dependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['app']);
  });

  it('detects ember app with ember-cli as an empty string', async function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': ''
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['app']);
  });

  it('detects ember addon with ember-cli as a devDependency', async function() {
    let packageJson = {
      keywords: [
        'ember-addon'
      ],
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['addon']);
  });

  it('detects ember addon with ember-cli as a dependency', async function() {
    let packageJson = {
      keywords: [
        'ember-addon'
      ],
      dependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['addon']);
  });

  it('detects ember addon with ember-cli as an empty string', async function() {
    let packageJson = {
      keywords: [
        'ember-addon'
      ],
      devDependencies: {
        'ember-cli': ''
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['addon']);
  });

  it('detects glimmer app with glimmer as a devDependency', async function() {
    let packageJson = {
      devDependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['glimmer']);
  });

  it('detects glimmer app with glimmer as a dependency', async function() {
    let packageJson = {
      dependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['glimmer']);
  });

  it('detects glimmer app with glimmer as an empty string', async function() {
    let packageJson = {
      devDependencies: {
        '@glimmer/blueprint': ''
      }
    };

    expect(await getProjectOptions(packageJson)).to.deep.equal(['glimmer']);
  });

  it('detects welcome option', async function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11',
        'ember-welcome-page': ''
      }
    };

    expect(await getProjectOptions(packageJson))
      .to.deep.equal(['app', 'welcome']);
  });

  it('detects yarn option', async function() {
    let packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    process.chdir(path.resolve(__dirname, '../fixtures/options/yarn'));

    expect(await getProjectOptions(packageJson))
      .to.deep.equal(['app', 'yarn']);
  });
});
