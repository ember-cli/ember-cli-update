# ember-cli-update

[![Greenkeeper badge](https://badges.greenkeeper.io/ember-cli/ember-cli-update.svg)](https://greenkeeper.io/)
[![npm version](https://badge.fury.io/js/ember-cli-update.svg)](https://badge.fury.io/js/ember-cli-update)
[![Build Status](https://travis-ci.org/ember-cli/ember-cli-update.svg?branch=master)](https://travis-ci.org/ember-cli/ember-cli-update)
[![Build status](https://ci.appveyor.com/api/projects/status/iguxxyxkiu9kyeyo/branch/master?svg=true)](https://ci.appveyor.com/project/embercli/ember-cli-update/branch/master)

Update Ember CLI Ember.js apps and addons (and Glimmer.js apps)

You can run this either as a global executable available to all projects or an Ember CLI command in a single project.

## Installation

As a global executable:

`npm install -g ember-cli-update`

As an Ember CLI command:

`ember install ember-cli-update`

(You must commit the change to `package.json` before running the update command or else you get an error.)

## Usage

Make sure your git working directory is clean before updating.

Inside your project directory, if you installed globally run

`ember-cli-update`

or if you installed as an Ember CLI command run

`ember update`

This will update your app or addon to the latest Ember CLI version. It does this by fetching the latest version and comparing it to your project's Ember CLI version. It then applies a diff of the changes from the latest version to your project. It will only modify the files if there are changes between your project's version and the latest version, and it will only change the section necessary, not the entire file.

This is different from the existing `ember init` command. That command tries to reset your project back to a brand new project. It removes all your changes and additions.

You will probably encounter merge conflicts, in which the default behavior is to let you resolve conflicts on your own. You can supply the `--resolve-conflicts` option to run your system's git merge tool if any conflicts are found.

This tool can also run codemods for you. The option `--run-codemods` will figure out what codemods apply to your current version of Ember, and download and run them for you.

## Examples

(These examples assume you are using the global command.)

To update to the latest version of Ember CLI:

```
ember-cli-update
```

To update to a certain version of Ember CLI:

```
ember-cli-update --to 3.1.0
```

To run codemods:

(This should be run after running the normal update shown above, and after you've resolved any conflicts.)

```
ember-cli-update --run-codemods
```

## Options

| Option | Description | Type | Examples | Default |
|---|---|---|---|---|
| --from | Use a starting version that is different than what is in your package.json | String | "2.9.1" | |
| --to | Update to a version that isn\'t latest | String | "2.14.1" "~2.15" "latest" "beta" | "latest" |
| --resolve-conflicts | Automatically run git mergetool if conflicts found | Boolean | | false |
| --run-codemods | Run codemods to help update your code | Boolean | | false |
| --reset | Reset your code to the default blueprint at the new version | Boolean | | false |
| --compare-only | Show the changes between different versions without updating | Boolean | | false |
| --dry-run | Show what would happen without actually doing it | Boolean | | false |
| --list-codemods | List available codemods | Boolean | | false |

## Hints

Need help using `git mergetool`? Here are some starting points:

* https://git-scm.com/docs/git-mergetool
* https://gist.github.com/karenyyng/f19ff75c60f18b4b8149

If you made a mistake during the update/conflict resolution, run these commands to undo everything and get you back to before the update:

```
git reset --hard
git clean -f
```

If you notice ".orig" files lying around after a merge and don't want that behavior, run `git config --global mergetool.keepBackup false`.

To avoid being prompted "Hit return to start merge resolution tool (vimdiff):" for every conflict, set a merge tool like `git config --global merge.tool "vimdiff"`.

If you run into an error like `error: unrecognized input`, you may need to update your git config color option like `git config --global color.ui auto`.

## Troubleshooting

If you are getting an error or unexpected results, running the command with the debug flag:

* Unix (global):&nbsp;&nbsp;&nbsp;`DEBUG=ember-cli-update,git-diff-apply ember-cli-update`
* Windows (global):&nbsp;&nbsp;&nbsp;`set DEBUG=ember-cli-update,git-diff-apply && ember-cli-update`
* Unix (command):&nbsp;&nbsp;&nbsp;`DEBUG=ember-cli-update,git-diff-apply ember update`
* Windows (command):&nbsp;&nbsp;&nbsp;`set DEBUG=ember-cli-update,git-diff-apply && ember update`

will give you more detailed logging.
