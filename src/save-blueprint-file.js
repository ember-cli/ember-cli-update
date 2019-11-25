'use strict';

const fs = require('fs-extra');
const path = require('path');
const getBlueprintFilePath = require('./get-blueprint-file-path');

async function saveBlueprintFile(cwd, emberCliUpdateJson) {
  emberCliUpdateJson.packages = emberCliUpdateJson.blueprints.reduce((packages, blueprint) => {
    let _package = packages.find(p => p.name === blueprint.packageName);

    if (!_package) {
      _package = {
        name: blueprint.packageName,
        location: blueprint.location,
        version: blueprint.version,
        blueprints: []
      };

      packages.push(_package);
    }

    _package.blueprints.push(blueprint);

    delete blueprint.packageName;
    delete blueprint.location;
    delete blueprint.version;

    return packages;
  }, []);

  delete emberCliUpdateJson.blueprints;

  let emberCliUpdateJsonPath = await getBlueprintFilePath(cwd);

  await fs.ensureDir(path.dirname(emberCliUpdateJsonPath));

  await fs.writeJson(emberCliUpdateJsonPath, emberCliUpdateJson, {
    spaces: 2,
    EOL: require('os').EOL
  });
}

module.exports = saveBlueprintFile;
