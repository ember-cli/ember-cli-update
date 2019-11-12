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

  it('returns blank blueprint if no params', async function() {
    let blueprint = _loadSafeDefaultBlueprint();

    expect(blueprint).to.deep.equal({
      name: 'ember-cli',
      type: 'app',
      version: undefined,
      isBaseBlueprint: true,
      options: [
        '--no-welcome'
      ]
    });
  });

  describe('app', function() {
    beforeEach(function() {
      projectOptions.push('app');
    });

    describe('welcome', function() {
      beforeEach(function() {
        projectOptions.push('welcome');
      });

      it('npm', async function() {
        let blueprint = loadSafeDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          name: 'ember-cli',
          type: 'app',
          version,
          isBaseBlueprint: true,
          options: []
        });
      });

      it('yarn', async function() {
        projectOptions.push('yarn');

        let blueprint = loadSafeDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          name: 'ember-cli',
          type: 'app',
          version,
          isBaseBlueprint: true,
          options: [
            '--yarn'
          ]
        });
      });
    });

    describe('no welcome', function() {
      it('npm', async function() {
        let blueprint = loadSafeDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          name: 'ember-cli',
          type: 'app',
          version,
          isBaseBlueprint: true,
          options: [
            '--no-welcome'
          ]
        });
      });

      it('yarn', async function() {
        projectOptions.push('yarn');

        let blueprint = loadSafeDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          name: 'ember-cli',
          type: 'app',
          version,
          isBaseBlueprint: true,
          options: [
            '--yarn',
            '--no-welcome'
          ]
        });
      });
    });
  });

  describe('addon', function() {
    beforeEach(function() {
      projectOptions.push('addon');
    });

    it('npm', async function() {
      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'addon',
        version,
        isBaseBlueprint: true,
        options: [
          '--no-welcome'
        ]
      });
    });

    it('yarn', async function() {
      projectOptions.push('yarn');

      let blueprint = loadSafeDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        name: 'ember-cli',
        type: 'addon',
        version,
        isBaseBlueprint: true,
        options: [
          '--yarn',
          '--no-welcome'
        ]
      });
    });
  });
});
