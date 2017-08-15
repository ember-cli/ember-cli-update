'use strict';

const fs = require('fs');
const got = require('got');
const sortPackageJson = require('sort-package-json');
const ThreeWayMerger = require('three-way-merger');
const rfc6902 = require('rfc6902');

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function applyDependencyOperations(operations, source) {
  operations.add.forEach((dep) => source[dep.name] = dep.version);
  operations.remove.forEach((dep) => delete source[dep.name]);
  operations.change.forEach((dep) => source[dep.name] = dep.version);
}

function mergeDependencyChanges(source, ours, theirs) {
  let mergeOperations = ThreeWayMerger.merge({ source, ours, theirs });

  // get a fresh copy so we don't mutate the passed in arg
  let result = clone(ours);

  applyDependencyOperations(mergeOperations.dependencies, result.dependencies);
  applyDependencyOperations(mergeOperations.devDependencies, result.devDependencies);

  return result;
}

function deleteDeps(input) {
  delete input.dependencies;
  delete input.devDependencies;
}

function mergeNonDependencyChanges(_source, _ours, _theirs) {
  let source = clone(_source);
  let ours = clone(_ours);
  let theirs = clone(_theirs);

  deleteDeps(source);
  deleteDeps(ours);
  deleteDeps(theirs);

  let fromSourceToOurs = rfc6902.createPatch(source, ours);

  rfc6902.applyPatch(theirs, fromSourceToOurs);

  return theirs;
}

module.exports = function autoMergePackageJson(projectType, from, to) {
  let projectKeyword = projectType === 'app' ? 'new' : 'addon';
  let remoteUrl = `https://rawgit.com/ember-cli/ember-${projectKeyword}-output`;

  return Promise.all([
    got(`${remoteUrl}/${from}/package.json`, { json: true }),
    got(`${remoteUrl}/${to}/package.json`, { json: true }),
  ])
    .then((results) => {
      let fromPackageJson = results[0].body;
      let toPackageJson = results[1].body;
      let currentPackageJson = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }));

      let mergedDependenciesPackageJson = mergeDependencyChanges(fromPackageJson, currentPackageJson, toPackageJson);
      let mergedOtherPackageJson = mergeNonDependencyChanges(fromPackageJson, currentPackageJson, toPackageJson);

      let finalMergedPackageJson = mergedOtherPackageJson;
      finalMergedPackageJson.dependencies = mergedDependenciesPackageJson.dependencies;
      finalMergedPackageJson.devDependencies = mergedDependenciesPackageJson.devDependencies;

      let sortedPackageJson = sortPackageJson(finalMergedPackageJson);

      fs.writeFileSync('package.json', JSON.stringify(sortedPackageJson, null, 2) + '\n', { encoding: 'utf-8' });
    });
}
