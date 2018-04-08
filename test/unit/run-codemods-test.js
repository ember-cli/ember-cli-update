'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const utils = require('../../src/utils');
const runCodemods = require('../../src/run-codemods');

describe('Unit - runCodemods', function() {
  let sandbox;
  let npx;
  let run;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    npx = sandbox.stub(utils, 'npx').resolves();
    run = sandbox.stub(utils, 'run').resolves();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('ember-modules-codemod', function() {
    it('runs on apps', function() {
      return runCodemods({
        projectType: 'app',
        startVersion: '2.16.0-beta.1'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-modules-codemod'))).to.be.ok;
      });
    });

    it('runs on addons', function() {
      return runCodemods({
        projectType: 'addon',
        startVersion: '2.16.0-beta.1'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-modules-codemod'))).to.be.ok;
      });
    });

    it('doesn\'t run on glimmer apps', function() {
      return runCodemods({
        projectType: 'glimmer',
        startVersion: '2.16.0-beta.1'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-modules-codemod'))).to.not.be.ok;
      });
    });

    it('doesn\'t run on old versions', function() {
      return runCodemods({
        projectType: 'app',
        startVersion: '2.15.1'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-modules-codemod'))).to.not.be.ok;
      });
    });
  });

  describe('ember-qunit-codemod', function() {
    it('runs on apps', function() {
      return runCodemods({
        projectType: 'app',
        startVersion: '3.0.0-beta.1'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-qunit-codemod'))).to.be.ok;
      });
    });

    it('runs on addons', function() {
      return runCodemods({
        projectType: 'addon',
        startVersion: '3.0.0-beta.1'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-qunit-codemod'))).to.be.ok;
      });
    });

    it('doesn\'t run on glimmer apps', function() {
      return runCodemods({
        projectType: 'glimmer',
        startVersion: '3.0.0-beta.1'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-qunit-codemod'))).to.not.be.ok;
      });
    });

    it('doesn\'t run on old versions', function() {
      return runCodemods({
        projectType: 'app',
        startVersion: '2.18.2'
      }).then(() => {
        expect(npx.calledWith(sinon.match('ember-qunit-codemod'))).to.not.be.ok;
      });
    });
  });

  it('stages files', function() {
    return runCodemods({
      startVersion: '0.0.0'
    }).then(() => {
      expect(run.calledOnce).to.be.ok;
    });
  });
});
