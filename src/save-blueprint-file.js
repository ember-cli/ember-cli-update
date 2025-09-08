'use strict';

const fs = require('fs-extra');
const path = require('path');

async function saveBlueprintFile(emberCliUpdateJsonPath, emberCliUpdateJson) {
  emberCliUpdateJson.packages = emberCliUpdateJson.blueprints.reduce(
    (packages, blueprint) => {
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

      if (!blueprint.options.length) {
        delete blueprint.options;
      }

      return packages;
    },
    []
  );

  delete emberCliUpdateJson.blueprints;

  await fs.ensureDir(path.dirname(emberCliUpdateJsonPath));

  await fs.writeJson(emberCliUpdateJsonPath, emberCliUpdateJson, {
    spaces: 2,
    EOL: require('os').EOL
  });
}

module.exports = saveBlueprintFile;
