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
        let status = run('git status', {
          cwd: tmpPath
        });

        expect(stderr).to.not.contain('Error:');
        expect(stderr).to.not.contain('fatal:');
        expect(stderr).to.not.contain('Command failed');

        let result = run('git log -1', {
          cwd: tmpPath
        });

        // verify it is not committed
        expect(result).to.contain('Author: Your Name <you@example.com>');
        expect(result).to.contain('add files');

        result = run('git branch', {
          cwd: tmpPath
        });

        // verify branch was deleted
        expect(result.trim()).to.contain('* master');

        resolve({
          status,
          stderr
        });
      });
    });
  }

  it.only('updates app', function() {
    return merge(
      'test/fixtures/local/my-app',
      'tmp/my-app'
    ).then(result => {
      let status = result.status;

      fixtureCompare(
        'tmp/my-app',
        'test/fixtures/merge/my-app'
      );

      expect(status).to.contain('new file:   added-changed.txt');
      expect(status).to.contain('renamed:    removed-unchanged.txt -> added-unchanged.txt');
      expect(status).to.contain('modified:   changed.txt');
      expect(status).to.contain('deleted:    removed-changed.txt');
    });
  });

  it('updates addon', function() {
    return merge(
      'test/fixtures/local/my-addon',
      'tmp/my-addon'
    ).then(result => {
      let status = result.status;

      fixtureCompare(
        'tmp/my-addon',
        'test/fixtures/merge/my-addon'
      );

      expect(status).to.contain('new file:   added-changed.txt');
      expect(status).to.contain('new file:   added-unchanged.txt');
      expect(status).to.contain('modified:   changed.txt');
      expect(status).to.contain('modified:   removed-changed.txt');
    });
  });
});
