'use strict';

const path = require('path');
const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const {
  buildTmp,
  processExit
} = require('git-fixtures');
const { isGitClean } = require('git-diff-apply');
const save = require('../../src/save');
const {
  assertNoStaged
} = require('../helpers/assertions');
const loadSafeBlueprintFile = require('../../src/load-safe-blueprint-file');

describe(save, function() {
  this.timeout(5e3);

  let tmpPath;

  async function merge({
    packageName,
    blueprint,
    from,
    outputRepo,
    codemodsSource,
    blueprintOptions,
    fixturesPath,
    commitMessage
  }) {
    tmpPath = await buildTmp({
      fixturesPath
    });

    let promise = save({
      cwd: tmpPath,
      packageName,
      blueprint,
      from,
      outputRepo,
      codemodsSource,
      blueprintOptions
    });

    return await processExit({
      promise,
      cwd: tmpPath,
      commitMessage,
      expect
    });
  }

  it('handles missing version', async function() {
    let {
      stderr
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app'
    });

    expect(await isGitClean({ cwd: tmpPath })).to.be.ok;

    expect(stderr).to.equal('A custom blueprint cannot detect --from. You must supply it.');
  });

  it('works for custom blueprint with package name', async function() {
    let {
      packageName,
      name,
      version,
      outputRepo,
      codemodsSource,
      options
    } = (await loadSafeBlueprintFile('test/fixtures/ember-cli-update-json/default/config/ember-cli-update.json')).blueprints[0];

    let {
      status
    } = await merge({
      fixturesPath: 'test/fixtures/app/local',
      commitMessage: 'my-app',
      packageName,
      blueprint: name,
      from: version,
      outputRepo,
      codemodsSource,
      blueprintOptions: options
    });

    assertNoStaged(status);

    expect(path.join(tmpPath, 'config/ember-cli-update.json')).to.be.a.file()
      .and.equal('test/fixtures/ember-cli-update-json/default/config/ember-cli-update.json');
  });
});
