'use strict';

const blueprintOverwriteRegex = /^\? Overwrite (.+)\? /m;

function overwriteBlueprintFiles(ps) {
  let existingMatches = [];

  ps.stdout.on('data', data => {
    let str = data.toString();

    // We want to prevent writing "y"'s than necessary.
    for (let existingMatch of existingMatches) {
      while (str.includes(existingMatch)) {
        str = str.replace(existingMatch, '');
      }
    }

    let matches = str.match(blueprintOverwriteRegex);
    if (matches) {
      let yes = 'y';
      let enter = '\n';
      ps.stdin.write(`${yes}${enter}`);

      existingMatches.push(matches[1]);
    }
  });
}

module.exports = overwriteBlueprintFiles;
