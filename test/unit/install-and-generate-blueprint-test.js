'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const installAndGenerateBlueprint = require('../../src/install-and-generate-blueprint');
const { resolvePackageName } = installAndGenerateBlueprint;
const sinon = require('sinon');

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
    afterEach(function() {
      sinon.restore();
    });

    it('the expected params are passed for blueprint', async function() {
      let stubbedSpawn = sinon.stub(installAndGenerateBlueprint, 'spawn').resolves();
      let stubbedEmber = sinon.stub(installAndGenerateBlueprint, 'ember').resolves();
      sinon.stub(installAndGenerateBlueprint, 'resolvePackageName').returns('hello-world');

      await installAndGenerateBlueprint({
        cwd: 'fake/path',
        addonNameOverride: '',
        packageName: '',
        version: '',
        blueprintPath: '',
        blueprintName: 'custom-blueprint',
        packageManager: 'yarn'
      });
      expect(stubbedSpawn.getCall(0).args[0]).to.equal('yarn');
      expect(stubbedSpawn.getCall(0).args[1]).to.include.members(['add', '--save-dev', 'hello-world']);
    });

    it('blueprint options were used to generate blueprint', async function() {
      sinon.stub(installAndGenerateBlueprint, 'spawn').resolves();
      let stubbedEmber = sinon.stub(installAndGenerateBlueprint, 'ember').resolves();
      sinon.stub(installAndGenerateBlueprint, 'resolvePackageName').returns('hello-world');
      await installAndGenerateBlueprint({
        cwd: 'fake/path',
        addonNameOverride: '',
        packageName: '',
        version: '',
        blueprintPath: '',
        blueprintOptions: ['--hello', 'world', '--another', 'option'],
        blueprintName: 'custom-blueprint',
        packageManager: 'yarn'
      });
      expect(stubbedEmber.getCall(0).args[0]).to.include.members(['g', 'custom-blueprint', '--hello', 'world', '--another', 'option']);
    });
  });
});
