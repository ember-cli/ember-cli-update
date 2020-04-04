# ember-cli-update

[![npm version](https://badge.fury.io/js/ember-cli-update.svg)](https://badge.fury.io/js/ember-cli-update)
![](https://github.com/ember-cli/ember-cli-update/workflows/CI/badge.svg)
[![Build status](https://ci.appveyor.com/api/projects/status/iguxxyxkiu9kyeyo/branch/master?svg=true)](https://ci.appveyor.com/project/embercli/ember-cli-update/branch/master)

Update [Ember CLI](https://ember-cli.com/) projects

Check out [the new guides](https://github.com/ember-cli/ember-cli-update/wiki).

You can run this either as a global executable available to all projects or an Ember CLI command in a single project.

Fetches list of codemods and instructions for your projects

This attempts to be a thin wrapper of [boilerplate-update](https://github.com/kellyselden/boilerplate-update).

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

This tool can also run codemods for you. The option `--run-codemods` will figure out what codemods apply to your current version of Ember.js, and download and run them for you.

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

```
  --help                         Show help                             [boolean]
  --version                      Show version number                   [boolean]
  --package-name, --package, -p  Provide a package that can contain many
                                 blueprints ("@glimmer/blueprint", "git+https://
                                 git@github.com/tildeio/libkit.git",
                                 "../blueprint")                        [string]
  --blueprint, -b                Provide a custom blueprint for use in the
                                 update ("@glimmer/blueprint", "git+https://git@
                                 github.com/tildeio/libkit.git", "../blueprint")
                                                                        [string]
  --from                         Use a starting version that is different than
                                 what is in your package.json ("2.9.1") [string]
  --to                           Update to a version that isn't latest
                                 ("2.14.1", "~2.15", "latest", "beta")  [string]
  --resolve-conflicts            Automatically run git mergetool if conflicts
                                 found                [boolean] [default: false]
  --run-codemods                 Run codemods to help update your code
                                                      [boolean] [default: false]
  --codemods-source              Supply your own codemods manifest via URL
                                 ("ember-app-codemods-manifest@*",
                                 "git+https://github.com/ember-cli/ember-app-cod
                                 emods-manifest.git#semver:*")          [string]
  --codemods-json                Supply your own codemods manifest via JSON (`{
                                 /* json */ }`)                         [string]
  --reset                        Reset your code to the default blueprint at the
                                 new version          [boolean] [default: false]
  --compare-only                 Show the changes between different versions
                                 without updating     [boolean] [default: false]
  --stats-only                   Show all calculated values regarding your
                                 project              [boolean] [default: false]
  --list-codemods                List available codemods
                                                      [boolean] [default: false]
  --output-repo                  An output repository of changes over time
                                                                        [string]
```

## Power User Guide

Let's update from Ember CLI 2.18.2 to Ember CLI 3.1.4

First, make sure you are on the latest ember-cli-update version for good measure.

```
npm install -g ember-cli-update
```

Then, run all compatible codemods against your current version. Since codemods are downloaded on the fly, they can be updated (and new ones added) without even getting a new version of ember-cli-update. Also, we may add additional codemods targeting your older version of Ember.js.

```
ember-cli-update --run-codemods
```

Assuming you are multiple versions behind of Ember CLI, you may want to update in stages. Unless you have a really simple app, updating in stages can help isolate upgrade issues.

```
ember-cli-update --to 3.0
```

Once you resolve conflicts and commit, You again want to run codemods. This is because new codemods targeting Ember.js 3.0 will now apply.

```
ember-cli-update --run-codemods
```

Now you are ready to update again. (If your final update is going to be the latest version of Ember CLI, you don't need the `--to` option.)

```
ember-cli-update --to 3.1
```

Again, after you resolve conflicts and commit, you want to run codemods because of new Ember.js 3.1 codemods.

```
ember-cli-update --run-codemods
```

And then you're done! You have a freshly updated app (or addon). As noted, you can consolidate these steps by doing a direct update, but then you may be confused if you encounter issues which version is to blame.

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

* Unix (global):&nbsp;&nbsp;&nbsp;`DEBUG=ember-cli-update,boilerplate-update,git-diff-apply ember-cli-update`
* Windows (global):&nbsp;&nbsp;&nbsp;`set DEBUG=ember-cli-update,boilerplate-update,git-diff-apply && ember-cli-update`
* Unix (command):&nbsp;&nbsp;&nbsp;`DEBUG=ember-cli-update,boilerplate-update,git-diff-apply ember update`
* Windows (command):&nbsp;&nbsp;&nbsp;`set DEBUG=ember-cli-update,boilerplate-update,git-diff-apply && ember update`

will give you more detailed logging.
