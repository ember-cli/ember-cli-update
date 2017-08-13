# ember-cli-update

[![Greenkeeper badge](https://badges.greenkeeper.io/kellyselden/ember-cli-update.svg)](https://greenkeeper.io/)
[![npm version](https://badge.fury.io/js/ember-cli-update.svg)](https://badge.fury.io/js/ember-cli-update)
[![Build Status](https://travis-ci.org/kellyselden/ember-cli-update.svg?branch=master)](https://travis-ci.org/kellyselden/ember-cli-update)
[![Build status](https://ci.appveyor.com/api/projects/status/68qn3jkwcg4273v2/branch/master?svg=true)](https://ci.appveyor.com/project/kellyselden/ember-cli-update/branch/master)

Update Ember CLI Ember.js apps and addons

## Installation

As a global executable:

`npm install -g ember-cli-update`

As an Ember CLI command:

`ember install ember-cli-update`

## Usage

Inside your project directory, either run

`ember-cli-update`

for global or

`ember update`

as an Ember CLI command.

This will update your app or addon to the latest Ember CLI version. It does this by grabbing your current installed Ember CLI version and looking up the latest version, then applying a diff of the changes needed to your project. Your project files will only get modified if they were changed in the by Ember CLI between versions, and it will only change the section necessary, not the entire file.

This is different from the existing `ember init` command. That command tries to reset your project back to a brand new project. It removes all your changes and additions.

You will probably encounter merge conflicts, in which your system's git merge tool will run.

## Options

| Option | Description | Type | Examples | Default |
|---|---|---|---|---|
| --from | Use a starting version that is different than what is in your package.json | String | "2.9.1" | |
| --to | Update to a version that isn\'t latest | String | "2.14.1" "~2.15" "latest" "beta" | "latest" |
| --ignore-conflicts | Handle merge conflicts yourself | Boolean | | false |

## Hints

Need help using `git mergetool`? Here are some starting points:

* https://git-scm.com/docs/git-mergetool

If you made a mistake during the update/conflict resolution, run these commands to undo everything and get you back to before the update:

```
git reset --hard
git clean -f
```

If you notice ".orig" files lying around after a merge and don't want that behavior, run `git config mergetool.keepBackup false`.

To avoid being prompted "Hit return to start merge resolution tool (vimdiff):" for every conflict, set a merge tool like `git config merge.tool "vimdiff"`.
