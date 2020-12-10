'use strict';

const checkForBlueprintUpdates = require('./check-for-blueprint-updates');
const inquirer = require('inquirer');
const loadSafeBlueprint = require('./load-safe-blueprint');
const { defaultTo } = require('./constants');

/**
 * Format the string that is displayed when user is prompted for a blueprint
 *
 * @param {object} blueprint - Expected to contain `name` and `version` attributes
 * @param {string} latestVersion - Latest version for the blueprint
 * @returns {string}
 */
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

/**
 * Facilitate prompting the user for which bllueprint that want to update
 *
 * @param cwd
 * @param emberCliUpdateJson
 * @param reset
 * @param compare
 * @param codemods
 * @param to
 * @returns {Promise<{blueprint: (*|{}), areAllUpToDate, to: string}>}
 */
async function chooseBlueprintUpdates({
  cwd,
  emberCliUpdateJson,
  reset,
  compare,
  codemods,
  to
}) {
  let existingBlueprint;
  let areAllUpToDate;

  let { blueprints } = emberCliUpdateJson;

  if (reset || compare || codemods) {
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

    let message;
    if (reset) {
      message = 'Which blueprint would you like to reset?';
    } else if (compare) {
      message = 'Which blueprint would you like to compare?';
    } else {
      message = 'Which blueprint would you like to run codemods for?';
    }

    existingBlueprint = (await chooseBlueprint({
      choicesByName,
      message
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
