'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const _getProjectOptions = require('../../src/get-project-options');

describe(_getProjectOptions, function() {
  let cwd;
  let packageJson;
  let blueprint;

  before(function() {
    cwd = process.cwd();
  });

  beforeEach(function() {
    packageJson = {};

    blueprint = { name: 'ember-cli' };
  });

  afterEach(function() {
    process.chdir(cwd);
  });

  function getProjectOptions() {
    return _getProjectOptions(packageJson, blueprint);
  }

  it('throws if not found', async function() {
    await expect(getProjectOptions())
      .to.eventually.be.rejectedWith('Ember CLI project type could not be determined');
  });

  it('detects ember app with ember-cli as a devDependency', async function() {
    packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['app']);
  });

  it('detects ember app with ember-cli as a dependency', async function() {
    packageJson = {
      dependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['app']);
  });

  it('detects ember app with ember-cli as an empty string', async function() {
    packageJson = {
      devDependencies: {
        'ember-cli': ''
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['app']);
  });

  it('detects ember addon with ember-cli as a devDependency', async function() {
    packageJson = {
      keywords: [
        'ember-addon'
      ],
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['addon']);
  });

  it('detects ember addon with ember-cli as a dependency', async function() {
    packageJson = {
      keywords: [
        'ember-addon'
      ],
      dependencies: {
        'ember-cli': '2.11'
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['addon']);
  });

  it('detects ember addon with ember-cli as an empty string', async function() {
    packageJson = {
      keywords: [
        'ember-addon'
      ],
      devDependencies: {
        'ember-cli': ''
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['addon']);
  });

  it('detects glimmer app with glimmer as a devDependency', async function() {
    packageJson = {
      devDependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['glimmer']);
  });

  it('detects glimmer app with glimmer as a dependency', async function() {
    packageJson = {
      dependencies: {
        '@glimmer/blueprint': '0.3'
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['glimmer']);
  });

  it('detects glimmer app with glimmer as an empty string', async function() {
    packageJson = {
      devDependencies: {
        '@glimmer/blueprint': ''
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['glimmer']);
  });

  it('detects welcome option', async function() {
    packageJson = {
      devDependencies: {
        'ember-cli': '2.11',
        'ember-welcome-page': ''
      }
    };

    expect(await getProjectOptions()).to.deep.equal(['app', 'welcome']);
  });

  it('detects yarn option', async function() {
    packageJson = {
      devDependencies: {
        'ember-cli': '2.11'
      }
    };

    process.chdir(path.resolve(__dirname, '../fixtures/options/yarn'));

    expect(await getProjectOptions()).to.deep.equal(['app', 'yarn']);
  });

  it('detects blueprint', async function() {
    blueprint = {};

    expect(await getProjectOptions()).to.deep.equal(['blueprint']);
  });
});
