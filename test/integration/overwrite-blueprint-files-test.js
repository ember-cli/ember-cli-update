'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp
} = require('git-fixtures');
const overwriteBlueprintFiles = require('../../src/overwrite-blueprint-files');
const run = require('../../src/run');
const { initBlueprint } = require('../helpers/blueprint');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');
const sinon = require('sinon');
const { ember } = require('../../src/ember-install-addon');

describe(overwriteBlueprintFiles, function() {
  this.timeout(3 * 60 * 1000);

  it('can install an addon with a default blueprint and no state file', async function() {
    let tmpPath = await buildTmp({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    });

    let {
      packageName,
      location
    } = (await loadSafeBlueprintFile('test/fixtures/blueprint/addon/legacy-app/merge/ideal/my-app')).blueprints[0];

    let blueprintPath = await initBlueprint({
      fixturesPath: 'test/fixtures/blueprint/addon/legacy',
      resolvedFrom: tmpPath,
      relativeDir: location
    });

    await run('npm install', { cwd: tmpPath });

    await run(`npm install ${blueprintPath}`, { cwd: tmpPath });

    let ps = ember(['g', packageName], { cwd: tmpPath, stdin: 'pipe' });

    let spy = sinon.spy(ps.stdin, 'write');

    overwriteBlueprintFiles(ps);

    await ps;

    expect(spy).to.have.callCount(2);
  });
});
