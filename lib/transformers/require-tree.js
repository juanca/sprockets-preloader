var fs = require('fs');
var path = require('path');

var decorate = require('../decorate.js');
var { getFilesInDirectory, partition } = require('../utils.js');

function isDirectory(path) {
  return fs.statSync(path).isDirectory();
};

function decorateFile(context, file) {
  return decorate(context, file, { require: true });
}

// `require_tree` has an undefined output
// but it looks like it sorts paths (directories with trailing '/') alphabetical
function decorateDirectory(context, directory) {
  var a, b;
  a = getFilesInDirectory(directory)
    .map(function(file) { return path.join(directory, file); });

  b = a
    .map(function(file, i) { return { index: i, value: file + '/' }; })
    .sort(function(a, b) { return +(a.value > b.value) || +(a.value === b.value) - 1; });

  return b
    .map(function(sorted) { return a[sorted.index]; })
    .reduce(function(files, file) {
      if (isDirectory(file))
        return files.concat(decorateDirectory(context, file));
      else
        return files.concat(decorateFile(context, file));
    }, []);
}

module.exports = function requireTreeTransformer(context, requireDir) {
  var directory = path.join(context, requireDir);

  if (directory) {
    return decorateDirectory(context, directory);
  } else {
    console.log('TREE UNRESOLVED:', context, requireDir);
    return [];
  }
};
