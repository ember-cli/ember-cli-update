'use strict';

const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const inquirer = require('inquirer');
const findBlueprint = require('./find-blueprint');
const loadSafeBlueprint = require('./load-safe-blueprint');

const toDefault = require('./args').to.default;

function formatBlueprintLine({
  name,
  currentVersion,
  latestVersion
}) {
  return `${name}, current: ${currentVersion}, latest: ${latestVersion}`;
}

async function chooseBlueprintUpdates({
  cwd,
  emberCliUpdateJson
}) {
  let to;
  let blueprint;

  let { blueprints } = emberCliUpdateJson;

  let blueprintUpdates = await checkForBlueprintUpdates({
    cwd,
    blueprints
  });

  let areAllUpToDate = blueprintUpdates.every(blueprintUpdate => blueprintUpdate.isUpToDate);
  if (!areAllUpToDate) {
    let choicesByName = blueprintUpdates.reduce((choices, blueprintUpdate) => {
      let name = formatBlueprintLine(blueprintUpdate);
      choices[name] = {
        blueprintUpdate,
        choice: {
          name,
          disabled: blueprintUpdate.isUpToDate
        }
      };
      return choices;
    }, {});

    let answer = await inquirer.prompt([{
      type: 'list',
      message: 'Blueprint updates have been found. Which one would you like to update?',
      name: 'blueprint',
      choices: Object.values(choicesByName).map(({ choice }) => choice)
    }]);

    let { blueprintUpdate } = choicesByName[answer.blueprint];

    let existingBlueprint = findBlueprint(emberCliUpdateJson, blueprintUpdate.packageName, blueprintUpdate.name);
    blueprint = loadSafeBlueprint(existingBlueprint);

    let latestVersion = `${blueprintUpdate.latestVersion} (latest)`;

    answer = await inquirer.prompt([{
      type: 'list',
      message: 'Do you want the latest version?',
      name: 'choice',
      choices: [
        latestVersion,
        'SemVer string'
      ]
    }]);

    if (answer.choice === latestVersion) {
      to = toDefault;
    } else {
      answer = await inquirer.prompt([{
        type: 'input',
        message: 'What version?',
        name: 'semver'
      }]);

      to = answer.semver;
    }
  }

  return {
    blueprintUpdates,
    areAllUpToDate,
    to,
    blueprint
  };
}

module.exports = chooseBlueprintUpdates;
module.exports.formatBlueprintLine = formatBlueprintLine;
