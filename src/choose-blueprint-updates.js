'use strict';

const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const inquirer = require('inquirer');
const loadSafeBlueprint = require('./load-safe-blueprint');
const { defaultTo } = require('./constants');

function formatBlueprintLine({
  blueprint,
  latestVersion
}) {
  return `${blueprint.name}, current: ${blueprint.version}, latest: ${latestVersion}`;
}

async function chooseBlueprint({
  choicesByName,
  message
}) {
  let answer = await inquirer.prompt([{
    type: 'list',
    message,
    name: 'blueprint',
    choices: Object.values(choicesByName).map(({ choice }) => choice)
  }]);

  return choicesByName[answer.blueprint];
}

async function chooseBlueprintUpdates({
  cwd,
  emberCliUpdateJson,
  reset,
  to
}) {
  let existingBlueprint;
  let areAllUpToDate;

  let { blueprints } = emberCliUpdateJson;

  if (reset) {
    let choicesByName = blueprints.reduce((choices, blueprint) => {
      let name = blueprint.packageName;
      choices[name] = {
        blueprint,
        choice: {
          name
        }
      };
      return choices;
    }, {});

    existingBlueprint = (await chooseBlueprint({
      choicesByName,
      message: 'Which blueprint would you like to reset?'
    })).blueprint;
  } else {
    let blueprintUpdates = await checkForBlueprintUpdates({
      cwd,
      blueprints
    });

    areAllUpToDate = blueprintUpdates.every(blueprintUpdate => blueprintUpdate.isUpToDate);

    if (areAllUpToDate) {
      // eslint-disable-next-line no-console
      console.log(`${blueprintUpdates.map(formatBlueprintLine).join(`
`)}

All blueprints are up-to-date!`);
    } else {
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

      let { blueprintUpdate } = await chooseBlueprint({
        choicesByName,
        message: 'Blueprint updates have been found. Which one would you like to update?'
      });

      existingBlueprint = blueprintUpdate.blueprint;

      if (typeof to !== 'string') {
        let latestVersion = `${blueprintUpdate.latestVersion} (latest)`;

        let answer = await inquirer.prompt([{
          type: 'list',
          message: 'Do you want the latest version?',
          name: 'choice',
          choices: [
            latestVersion,
            'SemVer string'
          ]
        }]);

        if (answer.choice === latestVersion) {
          to = defaultTo;
        } else {
          answer = await inquirer.prompt([{
            type: 'input',
            message: 'What version?',
            name: 'semver'
          }]);

          to = answer.semver;
        }
      }
    }
  }

  let blueprint = loadSafeBlueprint(existingBlueprint);

  return {
    areAllUpToDate,
    to,
    blueprint
  };
}

module.exports = chooseBlueprintUpdates;
module.exports.formatBlueprintLine = formatBlueprintLine;
