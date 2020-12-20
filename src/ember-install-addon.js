'use strict';

const execa = require('execa');
const semver = require('semver');
const debug = require('./debug');

// not fixed yet
// https://github.com/ember-cli/ember-cli/issues/8937
const buggyEmberCliRange = '*';

function ember(args, {
  cwd,
  stdin = 'inherit'
}) {
  debug(`ember ${args.join(' ')}`);

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
  addonNameOverride,
  packageName,
  version,
  blueprintPath,
  stdin
}) {
  let addon;

  if (addonNameOverride) {
    addon = addonNameOverride;
    if (version && !blueprintPath) {
      addon += `@${version}`;
    }
  }

  if (!addon) {
    addon = blueprintPath;
  }

  if (!addon) {
    addon = `${packageName}@${version}`;
  }

  let install = ember(['i', addon], { cwd, stdin });

  let generate;

  if (!blueprintPath) {
    generate = install;
  } else {
    let emberCliVersion = await getEmberCliVersion({ cwd });

    let isBuggyEmberCliVersion = semver.satisfies(emberCliVersion, buggyEmberCliRange);

    if (!isBuggyEmberCliVersion) {
      generate = install;
    } else {
      await install;

      generate = ember(['g', packageName], { cwd, stdin });
    }
  }

  return {
    ps: generate
  };
}

module.exports = emberInstallAddon;
module.exports.ember = ember;
