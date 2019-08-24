'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const _loadSafeDefaultBlueprint = require('../../src/load-safe-default-blueprint');

const version = '1.2.3';

describe(_loadSafeDefaultBlueprint, function() {
  let projectOptions;

  beforeEach(function() {
    projectOptions = [];
  });

  function loadSafeDefaultBlueprint() {
    return _loadSafeDefaultBlueprint(projectOptions, version);
  }

  describe('app', function() {
    beforeEach(function() {
      projectOptions.push('app');
    });

    it('npm, welcome', async function() {
      projectOptions.push('welcome');

      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'app',
        version,
        options: []
      });
    });

    it('npm, no welcome', async function() {
      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'app',
        version,
        options: [
          '--no-welcome'
        ]
      });
    });

    it('yarn, welcome', async function() {
      projectOptions.push('yarn');
      projectOptions.push('welcome');

      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'app',
        version,
        options: [
          '--yarn'
        ]
      });
    });

    it('yarn, no welcome', async function() {
      projectOptions.push('yarn');

      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'app',
        version,
        options: [
          '--yarn',
          '--no-welcome'
        ]
      });
    });
  });

  describe('addon', function() {
    beforeEach(function() {
      projectOptions.push('addon');
    });

    it('npm, welcome', async function() {
      projectOptions.push('welcome');

      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'addon',
        version,
        options: []
      });
    });

    it('npm, no welcome', async function() {
      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'addon',
        version,
        options: [
          '--no-welcome'
        ]
      });
    });

    it('yarn, welcome', async function() {
      projectOptions.push('yarn');
      projectOptions.push('welcome');

      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'addon',
        version,
        options: [
          '--yarn'
        ]
      });
    });

    it('yarn, no welcome', async function() {
      projectOptions.push('yarn');

      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'addon',
        version,
        options: [
          '--yarn',
          '--no-welcome'
        ]
      });
    });
  });
});
