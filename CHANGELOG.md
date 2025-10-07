# Changelog

## Release (2025-10-07)

* ember-cli-update 3.0.1 (patch)

#### :house: Internal
* `ember-cli-update`
  * [#1281](https://github.com/ember-cli/ember-cli-update/pull/1281) prepare for using oidc for deployment ([@mansona](https://github.com/mansona))

#### Committers: 1
- Chris Manson ([@mansona](https://github.com/mansona))

## Release (2025-10-07)

* ember-cli-update 3.0.0 (major)

#### :boom: Breaking Change
* `ember-cli-update`
  * [#1268](https://github.com/ember-cli/ember-cli-update/pull/1268) Drop support for Node < 20 ([@pichfl](https://github.com/pichfl))

#### :rocket: Enhancement
* `ember-cli-update`
  * [#1280](https://github.com/ember-cli/ember-cli-update/pull/1280) Warn users trying to upgrade past 6.7.0 - i.e. don't auto upgrade them to Vite ([@pichfl](https://github.com/pichfl))

#### :house: Internal
* `ember-cli-update`
  * [#1278](https://github.com/ember-cli/ember-cli-update/pull/1278) Purge Node 8 related code ([@pichfl](https://github.com/pichfl))
  * [#1270](https://github.com/ember-cli/ember-cli-update/pull/1270) swap to release-plan ([@mansona](https://github.com/mansona))
  * [#1274](https://github.com/ember-cli/ember-cli-update/pull/1274) update eslint and remove some strange plugins ([@mansona](https://github.com/mansona))
  * [#1271](https://github.com/ember-cli/ember-cli-update/pull/1271) Use Prettier ([@pichfl](https://github.com/pichfl))
  * [#1269](https://github.com/ember-cli/ember-cli-update/pull/1269) Move to pnpm ([@pichfl](https://github.com/pichfl))
  * [#1266](https://github.com/ember-cli/ember-cli-update/pull/1266) Disable scheduled CI runs ([@pichfl](https://github.com/pichfl))

#### Committers: 2
- Chris Manson ([@mansona](https://github.com/mansona))
- Florian Pichler ([@pichfl](https://github.com/pichfl))



## v2.0.1 (2023-09-28)

#### :bug: Bug Fix
* [#1249](https://github.com/ember-cli/ember-cli-update/pull/1249) fix projectName if there is no package.json name ([@mansona](https://github.com/mansona))

#### Committers: 1
- Chris Manson ([@mansona](https://github.com/mansona))

## v2.0.0 (2023-09-27)

#### :boom: Breaking Change
* [#1194](https://github.com/ember-cli/ember-cli-update/pull/1194) feat!: remove deprecated ability to run as ember addon command ([@kellyselden](https://github.com/kellyselden))

#### :rocket: Enhancement
* [#1211](https://github.com/ember-cli/ember-cli-update/pull/1211) use pacote instead of npm cli ([@kellyselden](https://github.com/kellyselden))

#### :bug: Bug Fix
* [#1240](https://github.com/ember-cli/ember-cli-update/pull/1240) Fix custom blueprints ([@mansona](https://github.com/mansona))

#### :memo: Documentation
* [#1192](https://github.com/ember-cli/ember-cli-update/pull/1192) add yargs-help-output ([@kellyselden](https://github.com/kellyselden))

#### :house: Internal
* [#1243](https://github.com/ember-cli/ember-cli-update/pull/1243) Fix CI ([@mansona](https://github.com/mansona))
* [#1199](https://github.com/ember-cli/ember-cli-update/pull/1199) remove redundant json ([@kellyselden](https://github.com/kellyselden))
* [#1201](https://github.com/ember-cli/ember-cli-update/pull/1201) upgrade getBlueprintNameOverride tests ([@kellyselden](https://github.com/kellyselden))
* [#1209](https://github.com/ember-cli/ember-cli-update/pull/1209) use .mocharc.js config files ([@kellyselden](https://github.com/kellyselden))
* [#1200](https://github.com/ember-cli/ember-cli-update/pull/1200) use proper promises in sinon stubs ([@kellyselden](https://github.com/kellyselden))
* [#1198](https://github.com/ember-cli/ember-cli-update/pull/1198) use getVersion from boilerplate-update ([@kellyselden](https://github.com/kellyselden))

<details>

  <summary> Dependency updates </summary>

* [#1170](https://github.com/ember-cli/ember-cli-update/pull/1170) Update dependency npm-package-arg to v9 ([@renovate[bot]](https://github.com/apps/renovate))
* [#1206](https://github.com/ember-cli/ember-cli-update/pull/1206) Update dependency standard-node-template to v3 ([@renovate[bot]](https://github.com/apps/renovate))
* [#1174](https://github.com/ember-cli/ember-cli-update/pull/1174) Update dependency sinon to v14 ([@renovate[bot]](https://github.com/apps/renovate))
* [#1202](https://github.com/ember-cli/ember-cli-update/pull/1202) Update dependency @kellyselden/node-template to v3 ([@renovate[bot]](https://github.com/apps/renovate))
* [#1166](https://github.com/ember-cli/ember-cli-update/pull/1166) Update dependency @kellyselden/node-template to v2.2.2 ([@renovate[bot]](https://github.com/apps/renovate))
* [#1207](https://github.com/ember-cli/ember-cli-update/pull/1207) update sinon-chai ([@kellyselden](https://github.com/kellyselden))
* [#1205](https://github.com/ember-cli/ember-cli-update/pull/1205) update dev deps ([@kellyselden](https://github.com/kellyselden))
* [#1190](https://github.com/ember-cli/ember-cli-update/pull/1190) Update dependency standard-node-template to v2.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
* [#1165](https://github.com/ember-cli/ember-cli-update/pull/1165) Update dependency mout to 1.2.3 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1180](https://github.com/ember-cli/ember-cli-update/pull/1180) Update dependency hosted-git-info [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1187](https://github.com/ember-cli/ember-cli-update/pull/1187) Update dependency underscore to 1.12.1 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1184](https://github.com/ember-cli/ember-cli-update/pull/1184) Update dependency path-parse to 1.0.7 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1182](https://github.com/ember-cli/ember-cli-update/pull/1182) Update dependency nanoid to 3.1.31 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1181](https://github.com/ember-cli/ember-cli-update/pull/1181) Update dependency lodash to 4.17.21 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1179](https://github.com/ember-cli/ember-cli-update/pull/1179) Update dependency handlebars to 4.7.7 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1178](https://github.com/ember-cli/ember-cli-update/pull/1178) Update dependency glob-parent to 5.1.2 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1177](https://github.com/ember-cli/ember-cli-update/pull/1177) Update dependency follow-redirects to 1.14.8 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1176](https://github.com/ember-cli/ember-cli-update/pull/1176) Update dependency engine.io to 4.0.0 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1175](https://github.com/ember-cli/ember-cli-update/pull/1175) Update dependency ansi-regex [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))
* [#1172](https://github.com/ember-cli/ember-cli-update/pull/1172) Update dependency async to 2.6.4 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))

</details>

#### Committers: 2
- Chris Manson ([@mansona](https://github.com/mansona))
- Kelly Selden ([@kellyselden](https://github.com/kellyselden))

# Changelog
