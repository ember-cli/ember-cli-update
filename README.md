# ember-cli-update

[![Greenkeeper badge](https://badges.greenkeeper.io/kellyselden/ember-cli-update.svg)](https://greenkeeper.io/)
[![npm version](https://badge.fury.io/js/ember-cli-update.svg)](https://badge.fury.io/js/ember-cli-update)
[![Build Status](https://travis-ci.org/kellyselden/ember-cli-update.svg?branch=master)](https://travis-ci.org/kellyselden/ember-cli-update)
[![Build status](https://ci.appveyor.com/api/projects/status/68qn3jkwcg4273v2/branch/master?svg=true)](https://ci.appveyor.com/project/kellyselden/ember-cli-update/branch/master)

Update Ember CLI Ember.js apps and addons

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

or if you installed as a command run

`ember update`

This will update your app or addon to the latest Ember CLI version. It does this by fetching the latest version and comparing it to your project's Ember CLI version. It then applies a diff of the changes from the latest version to your project. It will only modify the files if there are changes between your project's version and the latest version, and it will only change the section necessary, not the entire file.

This is different from the existing `ember init` command. That command tries to reset your project back to a brand new project. It removes all your changes and additions.

You will probably encounter merge conflicts, in which your system's git merge tool will run.

## Options

| Option | Description | Type | Examples | Default |
|---|---|---|---|---|
| --from | Use a starting version that is different than what is in your package.json | String | "2.9.1" | |
| --to | Update to a version that isn\'t latest | String | "2.14.1" "~2.15" "latest" "beta" | "latest" |
| --ignore-conflicts | Handle merge conflicts yourself | Boolean | | false |
| --run-codemods | Run codemods to help update your code | Boolean | | false |

## Future Plans

Next step is to run codemods when certain upgrades are detected, like ember-source, ember-data, etc. Bonus points if we can figure out how to lazily download said codemods, so we don't have to depend on them all at once (check out [lazy-require](https://github.com/bevry/lazy-require)).

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

## Troubleshooting

If you are getting an error or unexpected results, running the command with the debug flag:

* Unix (global):&nbsp;&nbsp;&nbsp;`DEBUG=ember-cli-update,git-diff-apply ember-cli-update`
* Windows (global):&nbsp;&nbsp;&nbsp;`set DEBUG=ember-cli-update,git-diff-apply && ember-cli-update`
* Unix (command):&nbsp;&nbsp;&nbsp;`DEBUG=ember-cli-update,git-diff-apply ember update`
* Windows (command):&nbsp;&nbsp;&nbsp;`set DEBUG=ember-cli-update,git-diff-apply && ember update`

will give you more detailed logging.
