'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const _loadDefaultBlueprint = require('../../src/load-default-blueprint');

const version = '1.2.3';

describe(_loadDefaultBlueprint, function () {
  let projectOptions;

  beforeEach(function () {
    projectOptions = [];
  });

  function loadDefaultBlueprint() {
    return _loadDefaultBlueprint(projectOptions, version);
  }

  it('returns blank blueprint if no params', async function () {
    let blueprint = _loadDefaultBlueprint();

    expect(blueprint).to.deep.equal({
      packageName: 'ember-cli',
      name: 'app',
      version: undefined,
      outputRepo: 'https://github.com/undefined/undefined',
      codemodsSource: 'ember-app-codemods-manifest@1',
      isBaseBlueprint: true,
      options: ['--no-welcome']
    });
  });

  describe('app', function () {
    beforeEach(function () {
      projectOptions.push('app');
    });

    describe('welcome', function () {
      beforeEach(function () {
        projectOptions.push('welcome');
      });

      it('npm', async function () {
        let blueprint = loadDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          packageName: 'ember-cli',
          name: 'app',
          version,
          outputRepo: 'https://github.com/ember-cli/ember-new-output',
          codemodsSource: 'ember-app-codemods-manifest@1',
          isBaseBlueprint: true,
          options: []
        });
      });

      it('yarn', async function () {
        projectOptions.push('yarn');

        let blueprint = loadDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          packageName: 'ember-cli',
          name: 'app',
          version,
          outputRepo: 'https://github.com/ember-cli/ember-new-output',
          codemodsSource: 'ember-app-codemods-manifest@1',
          isBaseBlueprint: true,
          options: ['--yarn']
        });
      });
    });

    describe('no welcome', function () {
      it('npm', async function () {
        let blueprint = loadDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          packageName: 'ember-cli',
          name: 'app',
          version,
          outputRepo: 'https://github.com/ember-cli/ember-new-output',
          codemodsSource: 'ember-app-codemods-manifest@1',
          isBaseBlueprint: true,
          options: ['--no-welcome']
        });
      });

      it('yarn', async function () {
        projectOptions.push('yarn');

        let blueprint = loadDefaultBlueprint();

        expect(blueprint).to.deep.equal({
          packageName: 'ember-cli',
          name: 'app',
          version,
          outputRepo: 'https://github.com/ember-cli/ember-new-output',
          codemodsSource: 'ember-app-codemods-manifest@1',
          isBaseBlueprint: true,
          options: ['--yarn', '--no-welcome']
        });
      });
    });
  });

  describe('addon', function () {
    beforeEach(function () {
      projectOptions.push('addon');
    });

    it('npm', async function () {
      let blueprint = loadDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        packageName: 'ember-cli',
        name: 'addon',
        version,
        outputRepo: 'https://github.com/ember-cli/ember-addon-output',
        codemodsSource: 'ember-addon-codemods-manifest@1',
        isBaseBlueprint: true,
        options: ['--no-welcome']
      });
    });

    it('yarn', async function () {
      projectOptions.push('yarn');

      let blueprint = loadDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        packageName: 'ember-cli',
        name: 'addon',
        version,
        outputRepo: 'https://github.com/ember-cli/ember-addon-output',
        codemodsSource: 'ember-addon-codemods-manifest@1',
        isBaseBlueprint: true,
        options: ['--yarn', '--no-welcome']
      });
    });
  });

  describe('glimmer', function () {
    beforeEach(function () {
      projectOptions.push('glimmer');
    });

    it('works', async function () {
      let blueprint = loadDefaultBlueprint();

      expect(blueprint).to.deep.equal({
        packageName: '@glimmer/blueprint',
        name: '@glimmer/blueprint',
        version,
        outputRepo: 'https://github.com/glimmerjs/glimmer-blueprint-output',
        isBaseBlueprint: true,
        options: []
      });
    });
  });
});
