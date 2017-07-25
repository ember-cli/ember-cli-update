'use strict';

const path = require('path');
const expect = require('chai').expect;
const cp = require('child_process');
const fs = require('fs-extra');
const fixturify = require('fixturify');
const run = require('../../src/run');

function gitInit(cwd) {
  run('git init', {
    cwd
  });

  run('git config user.email "you@example.com"', {
    cwd
  });

  run('git config user.name "Your Name"', {
    cwd
  });

  run('git config merge.tool "vimdiff"', {
    cwd
  });

  run('git config mergetool.keepBackup false', {
    cwd
  });
}

function buildTmp(
  fixturesPath,
  tmpPath
) {
  gitInit(tmpPath);

  fs.copySync(fixturesPath, tmpPath);

  run('git add -A', {
    cwd: tmpPath
  });

  run('git commit -m "add files"', {
    cwd: tmpPath
  });
}

function fixtureCompare(
  tmpPath,
  mergeFixtures
) {
  let actual = fixturify.readSync(tmpPath);
  let expected = fixturify.readSync(mergeFixtures);

  delete actual['.git'];

  expect(actual).to.deep.equal(expected);

  let result = run('git log -1', {
    cwd: tmpPath
  });

  expect(result).to.contain('Author: Your Name <you@example.com>');
  expect(result).to.contain('v2.11.1-v2.14.1');
  expect(result).to.not.contain('add files');
}

describe('Acceptance - ember-cli-build', function() {
  this.timeout(30000);

  let cwd;

  before(function() {
    cwd = process.cwd();
  });

  function merge(
    fixturesPath,
    tmpPath
  ) {
    fs.emptyDirSync(tmpPath);

    buildTmp(
      fixturesPath,
      tmpPath
    );

    let binFile = path.join(cwd, 'bin/ember-cli-update');

    return new Promise(resolve => {
      let ps = cp.spawn('node', [
        binFile,
        '--tag',
        'v2.14.1'
      ], {
        cwd: tmpPath,
        env: process.env
      });

      ps.stdout.on('data', data => {
        let str = data.toString();
        if (str.includes('Normal merge conflict')) {
          ps.stdin.write(':diffg 3\n');
          ps.stdin.write(':wqa\n');
        } else if (str.includes('Deleted merge conflict')) {
          ps.stdin.write('d\n');
        }
      });

      let stderr = '';

      ps.stderr.on('data', data => {
        stderr += data.toString();
      });

      ps.stderr.pipe(process.stdout);

      ps.on('exit', () => {
        expect(stderr).to.not.contain('Error:');
        expect(stderr).to.not.contain('fatal:');
        expect(stderr).to.not.contain('Command failed');

        resolve(stderr);
      });
    });
  }

  it('updates app', function() {
    return merge(
      'test/fixtures/local/my-app',
      'tmp/my-app'
    ).then(() => {
      fixtureCompare(
        'tmp/my-app',
        'test/fixtures/merge/my-app'
      );
    });
  });

  it('updates addon', function() {
    return merge(
      'test/fixtures/local/my-addon',
      'tmp/my-addon'
    ).then(() => {
      fixtureCompare(
        'tmp/my-addon',
        'test/fixtures/merge/my-addon'
      );
    });
  });
});
