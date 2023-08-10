'use strict';

const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const { spawn } = require('./run');
const utils = require('./utils');
const isDefaultBlueprint = require('./is-default-blueprint');
const installAndGenerateBlueprint = require('./install-and-generate-blueprint');
const overwriteBlueprintFiles = require('./overwrite-blueprint-files');
const debug = require('./debug');
const npm = require('boilerplate-update/src/npm');
const mutatePackageJson = require('boilerplate-update/src/mutate-package-json');
const { glimmerPackageName } = require('./constants');
const hasYarn = require('./has-yarn');

const nodeModulesIgnore = `

/node_modules/
`;

// remove when node 8 is dropped
const lastNode8Version = '3.16';

module.exports = function getStartAndEndCommands({
  packageJson: { name: projectName },
  baseBlueprint,
  startBlueprint,
  endBlueprint
}) {
  if (baseBlueprint && !baseBlueprint.isBaseBlueprint) {
    throw new Error('The intended base blueprint is not actually a base blueprint.');
  }

  if (endBlueprint.isBaseBlueprint && baseBlueprint) {
    throw new Error('You supplied two layers of base blueprints.');
  }

  let isCustomBlueprint = !isDefaultBlueprint(endBlueprint);
  let isGlimmer = endBlueprint.packageName === glimmerPackageName && endBlueprint.name === glimmerPackageName;

  let startRange;
  let endRange;
  if (!isCustomBlueprint && !isGlimmer) {
    startRange = startBlueprint && startBlueprint.version;
    endRange = endBlueprint.version;
  } else if (!endBlueprint.isBaseBlueprint && isDefaultBlueprint(baseBlueprint)) {
    startRange = endRange = baseBlueprint.version;
  } else {
    // first version that supports blueprints with versions
    // `-b foo@1.2.3`
    // https://github.com/ember-cli/ember-cli/pull/8571
    startRange = endRange = `>=3.11.0-beta.1 <${lastNode8Version}`;
  }

  return {
    projectName,
    packageName: 'ember-cli',
    commandName: 'ember',
    createProjectFromCache: createProject(runEmberLocally),
    createProjectFromRemote: createProject(runEmberRemotely),
    startOptions: {
      baseBlueprint,
      blueprint: startBlueprint,

      // for cache detection logic
      packageRange: startRange
    },
    endOptions: {
      baseBlueprint,
      blueprint: endBlueprint,

      // for cache detection logic
      packageRange: endRange
    }
  };
};

async function isDefaultAddonBlueprint(blueprint) {
  let isCustomBlueprint = !isDefaultBlueprint(blueprint);

  let isDefaultAddonBlueprint;

  if (isCustomBlueprint) {
    let keywords;
    if (blueprint.path) {
      keywords = utils.require(path.join(blueprint.path, 'package')).keywords;
    } else {
      keywords = await npm.json('v', blueprint.packageName, 'keywords');
    }

    isDefaultAddonBlueprint = !(keywords && keywords.includes('ember-blueprint'));
  }

  return isDefaultAddonBlueprint;
}

function getArgs({
  projectName,
  directoryName,
  blueprint
}) {
  let args = [
    'new',
    projectName
  ];

  if (directoryName !== projectName) {
    args.push(`-dir=${directoryName}`);
  }

  args.push('-sg');

  let _blueprint;
  if (blueprint.path) {
    // Only use path when necessary, because `npm install <folder>`
    // symlinks instead of actually installing, so any peerDeps won't
    // work. Example https://github.com/salsify/ember-cli-dependency-lint/blob/v1.0.3/lib/commands/dependency-lint.js#L5
    _blueprint = blueprint.path;
  } else {
    let isCustomBlueprint = !isDefaultBlueprint(blueprint);
    let isGlimmer = blueprint.packageName === glimmerPackageName && blueprint.name === glimmerPackageName;

    if (isCustomBlueprint || isGlimmer) {
      _blueprint = `${blueprint.packageName}@${blueprint.version}`;
    } else {
      _blueprint = blueprint.name;
    }
  }

  return [
    ...args,
    '-sn',
    '-b',
    _blueprint,
    ...blueprint.options
  ];
}

module.exports.spawn = function spawn(command, args, options) {
  debug(`${command} ${args.join(' ')}`);

  let ps = execa(command, args, {
    stdio: ['pipe', 'pipe', 'inherit'],
    ...options
  });

  ps.stdout.pipe(process.stdout);

  return ps;
};

module.exports.npx = function npx(args, options) {
  return utils.npx(args.join(' '), options);
};

function runEmberLocally({
  packageRoot,
  cwd,
  args
}) {
  return module.exports.spawn('node', [
    path.join(packageRoot, 'bin/ember'),
    ...args
  ], { cwd });
}

function runEmberRemotely({
  cwd,
  blueprint,
  args
}) {
  let isCustomBlueprint = !isDefaultBlueprint(blueprint);
  let isGlimmer = blueprint.packageName === glimmerPackageName && blueprint.name === glimmerPackageName;

  if (isCustomBlueprint || isGlimmer) {
    args = [`ember-cli@${lastNode8Version}`, ...args];
    // args = ['-p', 'github:ember-cli/ember-cli#cfb9780', 'ember', 'new', projectName, `-dir=${directoryName}, '-sg', -sn', '-b', `${blueprint.packageName}@${blueprint.version}`];
  } else {
    args = ['-p', `ember-cli@${blueprint.version}`, 'ember', ...args];
  }

  return module.exports.npx(args, { cwd });
}

function createProject(runEmber) {
  return ({
    packageRoot,
    options: {
      projectName,
      baseBlueprint,
      blueprint
    }
  }) => {
    return async function createProject(cwd) {
      if (!blueprint) {
        return cwd;
      }

      let projectRoot;

      async function _runEmber(blueprint) {
        async function __runEmber() {
          // remove scope
          let directoryName = projectName.replace(/^@.+\//, '');

          let args = getArgs({
            projectName,
            directoryName,
            blueprint
          });

          await runEmber({
            packageRoot,
            cwd,
            blueprint,
            args
          });

          projectRoot = path.join(cwd, directoryName);
        }

        try {
          await __runEmber();
        } catch (err) {
          // We currently do not support a name of `...`.
          projectName = 'my-project';

          await __runEmber();
        }
      }

      if (await isDefaultAddonBlueprint(blueprint)) {
        let isYarnProject = await hasYarn(projectRoot);

        await _runEmber(baseBlueprint);

        await module.exports.installAddonBlueprint({
          projectRoot,
          blueprint,
          packageManager: isYarnProject ? 'yarn' : 'npm'
        });
      } else {
        await _runEmber(blueprint);
      }

      if (!isDefaultBlueprint(blueprint)) {
        // This might not be needed anymore.
        await module.exports.appendNodeModulesIgnore({
          projectRoot
        });
      }

      return projectRoot;
    };
  };
}

/**
 * Install packages from package.json then install the specified package and generate blueprint
 *
 * @param {string} projectRoot - Used as cwd for running npm commands as well directory to make file modifications
 * @param {object} blueprint - Expected to have `packageName`, `version`, and `path` (nullable) attributes
 * @param {string} packageManager - Expected to be either `npm` or `yarn`
 * @returns {Promise<void>}
 */
module.exports.installAddonBlueprint = async function installAddonBlueprint({
  projectRoot,
  blueprint,
  packageManager
}) {
  // `not found: ember` without this
  await spawn(packageManager, ['install'], { cwd: projectRoot });

  let { ps } = await installAndGenerateBlueprint({
    cwd: projectRoot,
    packageName: blueprint.packageName,
    version: blueprint.version,
    blueprintPath: blueprint.path,
    blueprintName: blueprint.name,
    blueprintOptions: blueprint.options,
    stdin: 'pipe',
    packageManager
  });

  overwriteBlueprintFiles(ps);

  await ps;

  await mutatePackageJson(projectRoot, packageJson => {
    packageJson.devDependencies[blueprint.packageName] = blueprint.version;
  });

  await fs.remove(path.join(projectRoot, 'package-lock.json'));
};

async function appendNodeModulesIgnore({
  projectRoot
}) {
  if (!await fs.pathExists(path.join(projectRoot, 'node_modules'))) {
    return;
  }

  let isIgnoringNodeModules;
  let gitignore = '';
  try {
    gitignore = await fs.readFile(path.join(projectRoot, '.gitignore'), 'utf8');

    isIgnoringNodeModules = /^\/?node_modules\/?$/m.test(gitignore);
  } catch (err) {}
  if (!isIgnoringNodeModules) {
    await fs.writeFile(path.join(projectRoot, '.gitignore'), `${gitignore}${nodeModulesIgnore}`);
  }
}

module.exports.appendNodeModulesIgnore = appendNodeModulesIgnore;
module.exports.getArgs = getArgs;
