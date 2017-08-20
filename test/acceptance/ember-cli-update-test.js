'use strict';

const path = require('path');
const expect = require('chai').expect;
const cp = require('child_process');
const fs = require('fs-extra');
const fixturify = require('fixturify');
const gitFixtures = require('git-fixtures');
const run = require('../../src/run');

const gitInit = gitFixtures.gitInit;

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

  run('git checkout -b foo', {
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
    tmpPath,
    messages
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
        '--to',
        '2.14.1'
      ], {
        cwd: tmpPath,
        env: process.env
      });

      let i = 0;
      ps.stdout.on('data', data => {
        let str = data.toString();
        if (str.includes('Normal merge conflict')) {
          ps.stdin.write(':%diffg 3\n');
          ps.stdin.write(':wqa\n');
          i++;
        } else if (str.includes('Deleted merge conflict')) {
          ps.stdin.write('d\n');
          i++;
        }
        if (i === messages) {
          // this is only needed because 'inherit' isn't working in node 4 windows
          ps.stdin.end();
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
        expect(result.trim()).to.match(/\* foo\r?\n {2}master/);

        resolve({
          status,
          stderr
        });
      });
    });
  }

  it('updates app', function() {
    return merge(
      'test/fixtures/local/my-app',
      'tmp/my-app',
      2
    ).then(result => {
      let status = result.status;

      fixtureCompare(
        'tmp/my-app',
        'test/fixtures/merge/my-app'
      );

      // changed locally, no change upstream
      expect(status).to.not.contain(' .ember-cli');

      // exists locally, also added upstream with changes
      expect(status).to.contain('modified:   .eslintrc.js');

      // changed locally, removed upstream
      expect(status).to.contain('deleted:    bower.json');

      // changed locally, also changed upstream
      expect(status).to.contain('modified:   README.md');
    });
  });

  it('updates addon', function() {
    return merge(
      'test/fixtures/local/my-addon',
      'tmp/my-addon',
      2
    ).then(result => {
      let status = result.status;

      fixtureCompare(
        'tmp/my-addon',
        'test/fixtures/merge/my-addon'
      );

      // changed locally, no change upstream
      expect(status).to.not.contain(' .ember-cli');

      // exists locally, also added upstream with changes
      expect(status).to.contain('modified:   .eslintrc.js');

      // changed locally, removed upstream
      expect(status).to.contain('deleted:    bower.json');

      // changed locally, also changed upstream
      expect(status).to.contain('modified:   README.md');
    });
  });
});
