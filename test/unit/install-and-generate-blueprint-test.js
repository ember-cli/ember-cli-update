'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const installAndGenerateBlueprint = require('../../src/install-and-generate-blueprint');
const { resolvePackageName } = installAndGenerateBlueprint;

describe('install-and-generate-blueprint module', function() {
  describe('#resolvePackageName', function() {
    it('addonNameOverride takes precedence', function() {
      let result = resolvePackageName('hello-world');
      expect(result).to.equal('hello-world');
    });
    it('addonNameOverride with version takes precedence', function() {
      let result = resolvePackageName('hello-world', '', '1.2.3');
      expect(result).to.equal('hello-world@1.2.3');
    });
    it('blueprint path is returned if override not passed', function() {
      let result = resolvePackageName('', 'path/to/blueprint');
      expect(result).to.equal('path/to/blueprint');
    });
    it('package name with version is returned', function() {
      let result = resolvePackageName('', '', '1.2.3', 'package-name');
      expect(result).to.equal('package-name@1.2.3');
    });
  });

  describe('#installAndGenerateBlueprint', function() {
    beforeEach(function() {
      this.originalSpawn = installAndGenerateBlueprint.spawn;
      this.originalEmber = installAndGenerateBlueprint.ember;
      this.originalResolvePackageName = installAndGenerateBlueprint.resolvePackageName;
    });
    afterEach(function() {
      installAndGenerateBlueprint.spawn = this.originalSpawn;
      installAndGenerateBlueprint.ember = this.originalEmber;
      installAndGenerateBlueprint.resolvePackageName = this.originalResolvePackageName;
    });

    it('ensure the expected params are passed for blueprint', async function() {
      installAndGenerateBlueprint.spawn = (packageManager, args) => {
        expect(packageManager).to.equal('yarn');
        expect(args).to.include.members(['add', '--save-dev', 'hello-world']);
      };
      installAndGenerateBlueprint.ember = (args) => {
        expect(args).to.include.members(['g', 'custom-blueprint']);
      };
      installAndGenerateBlueprint.resolvePackageName = () => 'hello-world';
      await installAndGenerateBlueprint({
        cwd: 'fake/path',
        addonNameOverride: '',
        packageName: '',
        version: '',
        blueprintPath: '',
        blueprintName: 'custom-blueprint',
        packageManager: 'yarn'
      });
    });
  });
});
