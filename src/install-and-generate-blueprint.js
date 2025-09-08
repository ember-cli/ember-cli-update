'use strict';

const execa = require('execa');
const { spawn } = require('./run');
const debug = require('./debug');

function ember(args, { cwd, stdin = 'inherit' }) {
  debug(`ember ${args.join(' ')}`);

  let ps = execa('ember', args, {
    cwd,
    preferLocal: true,
    stdio: [stdin, 'pipe', 'inherit']
  });

  ps.stdout.pipe(process.stdout);

  return ps;
}

/**
 * Generate the package name string for the `install` command
 */
function resolvePackageName(
  addonNameOverride,
  blueprintPath,
  version,
  packageName
) {
  let resolvedPackageName;

  if (addonNameOverride) {
    resolvedPackageName = addonNameOverride;
    if (version && !blueprintPath) {
      resolvedPackageName += `@${version}`;
    }
  }

  if (!resolvedPackageName) {
    resolvedPackageName = blueprintPath;
  }

  if (!resolvedPackageName) {
    resolvedPackageName = `${packageName}@${version}`;
  }

  return resolvedPackageName;
}

const INSTALL_COMMAND = {
  npm: 'install',
  yarn: 'add'
};

/**
 * Install package and generate the specific blueprint.
 *
 * @param {string} cwd - Use this folder as thee current working directory for execa calls
 * @param {string} addonNameOverride - Optional. If passed use this string as the package bane
 * @param {string} packageName - Name of package to install
 * @param {string} version - Optional. Specific version to install of the package
 * @param {string} blueprintPath - Optional. Path on local disk of package or git uri
 * @param {string} blueprintName - Optional. Name of the blueprint to run `ember g <blueprintName>`
 * @param {array<string>} blueprintOptions - Options used for `ember g <blueprintName>`
 * @param {object} stdin - Use this as stdin for child process runs
 * @param {string} packageManager - Expected to be either `npm` or `yarn`
 * @returns {Promise<{ps: *}>}
 */
async function installAndGenerateBlueprint({
  cwd,
  addonNameOverride,
  packageName,
  version,
  blueprintPath,
  blueprintName,
  blueprintOptions,
  stdin,
  packageManager
}) {
  let resolvedPackageName = module.exports.resolvePackageName(
    addonNameOverride,
    blueprintPath,
    version,
    packageName
  );

  await module.exports.spawn(
    packageManager,
    [INSTALL_COMMAND[packageManager], '--save-dev', resolvedPackageName],
    {
      cwd
    }
  );

  let generateProcess = module.exports.ember(
    ['g', blueprintName, ...blueprintOptions],
    {
      cwd,
      stdin
    }
  );

  return {
    ps: generateProcess
  };
}

module.exports = installAndGenerateBlueprint;
module.exports.ember = ember;
module.exports.resolvePackageName = resolvePackageName;
module.exports.spawn = spawn;
