'use strict';

const boilerplateUpdate = require('boilerplate-update');
const getStartAndEndCommands = require('./get-start-and-end-commands');
const parseBlueprintPackage = require('./parse-blueprint-package');
const saveBlueprint = require('./save-blueprint');
const loadDefaultBlueprintFromDisk = require('./load-default-blueprint-from-disk');
const loadSafeBlueprint = require('./load-safe-blueprint');
const loadSafeBlueprintFile = require('./load-safe-blueprint-file');
const stageBlueprintFile = require('./stage-blueprint-file');
const { getBlueprintRelativeFilePath } = require('./get-blueprint-file-path');
const findBlueprint = require('./find-blueprint');
const getBaseBlueprint = require('./get-base-blueprint');
const getBlueprintFilePath = require('./get-blueprint-file-path');
const resolvePackage = require('./resolve-package');

const {
  'to': { default: toDefault }
} = require('./args');
const {
  blueprintOptionsDefault
} = require('../bin/commands/init');

module.exports = async function init({
  blueprint: _blueprint,
  to = toDefault,
  resolveConflicts,
  reset,
  blueprintOptions = blueprintOptionsDefault,
  wasRunAsExecutable
}) {
  let cwd = process.cwd();

  // A custom config location in package.json may be reset/init away,
  // so we can no longer look it up on the fly after the run.
  // We must rely on a lookup before the run.
  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  let packageName;
  let name;
  let location;
  let url;
  if (_blueprint) {
    let parsedPackage = await parseBlueprintPackage({
      cwd,
      blueprint: _blueprint
    });
    packageName = parsedPackage.name;
    name = parsedPackage.name;
    location = parsedPackage.location;
    url = parsedPackage.url;
  } else {
    let defaultBlueprint = await loadDefaultBlueprintFromDisk(cwd);
    packageName = defaultBlueprint.packageName;
    name = defaultBlueprint.name;
  }

  let packageInfo = await resolvePackage({
    name: packageName,
    url,
    range: to
  });

  packageName = packageInfo.name;
  if (!name) {
    name = packageInfo.name;
  }
  let version = packageInfo.version;
  let _path = packageInfo.path;

  let emberCliUpdateJson = await loadSafeBlueprintFile(emberCliUpdateJsonPath);

  let blueprint;

  let existingBlueprint = findBlueprint(emberCliUpdateJson, packageName, name);
  if (existingBlueprint) {
    blueprint = existingBlueprint;
  } else {
    blueprint = {
      packageName,
      name,
      location,
      options: blueprintOptions
    };
  }

  blueprint = loadSafeBlueprint(blueprint);

  blueprint.version = version;
  blueprint.path = _path;

  await foo({
    cwd,
    projectName: (await getPackageJson()).name,
    packageRoot: path.resolve(__dirname, '../node_modules/ember-cli'),
    blueprint
  });

  let baseBlueprint = await getBaseBlueprint({
    cwd,
    blueprints: emberCliUpdateJson.blueprints,
    blueprint
  });

  // let init = false;

  if (!baseBlueprint) {
    // for non-existing default blueprints
    blueprint.isBaseBlueprint = true;
    // init = true;
  }

  // let result = await (await boilerplateUpdate({
  //   endVersion: blueprint.version,
  //   resolveConflicts,
  //   reset,
  //   init,
  //   createCustomDiff: true,
  //   customDiffOptions: ({
  //     packageJson
  //   }) => getStartAndEndCommands({
  //     packageJson,
  //     baseBlueprint,
  //     endBlueprint: blueprint
  //   }),
  //   ignoredFiles: [await getBlueprintRelativeFilePath(cwd)],
  //   wasRunAsExecutable
  // })).promise;

  await saveBlueprint({
    emberCliUpdateJsonPath,
    blueprint
  });

  if (!(reset || init)) {
    await stageBlueprintFile({
      cwd,
      emberCliUpdateJsonPath
    });
  }

  // return result;
};

const path = require('path');
const utils = require('./utils');
const isDefaultBlueprint = require('./is-default-blueprint');
const getPackageJson = require('boilerplate-update/src/get-package-json');
const execa = require('execa');
const debug = require('debug')('ember-cli-update');

module.exports.spawn = function spawn(command, args, options) {
  debug(`${command} ${args.join(' ')}`);

  let ps = execa(command, args, {
    // stdio: ['pipe', 'pipe', 'inherit'],
    stdio: 'inherit',
    ...options
  });

  // ps.stdout.pipe(process.stdout);

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

  if (isCustomBlueprint) {
    args = ['ember-cli', ...args];
    // args = ['-p', 'github:ember-cli/ember-cli#cfb9780', 'ember', 'new', projectName, `-dir=${directoryName}, '-sg', -sn', '-b', `${blueprint.packageName}@${blueprint.version}`];
  } else {
    args = ['-p', `ember-cli@${blueprint.version}`, 'ember', ...args];
  }

  return module.exports.npx(args, { cwd });
}

const runEmber = runEmberLocally;

async function foo({
  projectName,
  packageRoot,
  cwd,
  blueprint
}) {
  // remove scope
  let directoryName = projectName.replace(/^@.+\//, '');

  // let projectRoot = path.join(cwd, directoryName);

  async function _runEmber(blueprint) {
    let _cwd = cwd;

    // if (!blueprint.isBaseBlueprint) {
    //   _cwd = projectRoot;
    // }

    let args = getStartAndEndCommands.getArgs({
      projectName,
      directoryName,
      blueprint
    });

    let ps = runEmber({
      packageRoot,
      cwd: _cwd,
      blueprint,
      args
    });

    // module.exports.overwriteBlueprintFiles(ps);

    await ps;
  }

  await _runEmber(blueprint);
}
