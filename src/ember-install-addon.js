'use strict';

const execa = require('execa');
const semver = require('semver');

// not fixed yet
// https://github.com/ember-cli/ember-cli/issues/8937
const buggyEmberCliRange = '*';

function ember(args, {
  cwd,
  stdin = 'inherit'
}) {
  let ps = execa('ember', args, {
    cwd,
    preferLocal: true,
    stdio: [stdin, 'pipe', 'inherit']
  });

  ps.stdout.pipe(process.stdout);

  return ps;
}

async function getEmberCliVersion({
  cwd
}) {
  // Perhaps `npm ls` or even `require` would be faster/better...
  let { stdout } = await ember(['v'], { cwd });

  return stdout.match(/^ember-cli: (.+)$/m)[1];
}

async function emberInstallAddon({
  cwd,
  addonName,
  blueprintPackageName,
  stdin
}) {
  let emberCliVersion = await getEmberCliVersion({ cwd });

  let install = ember(['i', addonName], { cwd, stdin });

  let generate;

  let isBuggyEmberCliVersion = semver.satisfies(emberCliVersion, buggyEmberCliRange);

  if (!isBuggyEmberCliVersion) {
    generate = install;
  } else {
    await install;

    generate = ember(['g', blueprintPackageName], { cwd, stdin });
  }

  return {
    ps: generate
  };
}

module.exports = emberInstallAddon;
module.exports.ember = ember;
