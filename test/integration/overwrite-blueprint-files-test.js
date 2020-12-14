'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp
} = require('git-fixtures');
const overwriteBlueprintFiles = require('../../src/overwrite-blueprint-files');
const { spawn } = require('../../src/run');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const sinon = require('sinon');
const { ember } = require('../../src/install-and-generate-blueprint');

describe(overwriteBlueprintFiles, function() {
  this.timeout(60 * 1000);

  it('can install an addon with a default blueprint and no state file', async function() {
    let tmpPath = await buildTmp({
      fixturesPath: 'test/fixtures/app/local'
    });

    let {
      packageName,
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/legacy-app/merge/my-app/config/ember-cli-update.json')).blueprints[1];

    let blueprintPath = await initBlueprint({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy',
      resolvedFrom: tmpPath,
      relativeDir: location
    });

    await spawn('npm', ['install'], { cwd: tmpPath });

    await spawn('npm', ['install', blueprintPath], { cwd: tmpPath });

    let ps = ember(['g', packageName], { cwd: tmpPath, stdin: 'pipe' });

    let spy = sinon.spy(ps.stdin, 'write');

    overwriteBlueprintFiles(ps);

    await ps;

    expect(spy).to.have.callCount(2);
  });
});
