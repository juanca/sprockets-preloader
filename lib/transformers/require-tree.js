var fs = require('fs');
var path = require('path');

var decorate = require('../decorate.js');
var { getFilesInDirectory } = require('../utils.js');

function getAllFilesInTree(context, directory) {
  return getFilesInDirectory(directory)
    .map(function(file) { return path.join(directory, file); })
    .reduce(function(requires, file) {
      if(fs.statSync(file).isDirectory()) {
        return requires.concat(getAllFilesInTree(context, file));
      } else {
        return requires.concat(decorate(context, file, { require: true }));
      }
    }, []);
}

module.exports = function requireTreeTransformer(context, requireDir) {
  var assetDir = path.join(context, requireDir);

  if (assetDir) {
    return getAllFilesInTree(context, assetDir);
  } else {
    console.log('TREE UNRESOLVED:', context, requireDir);
    return [];
  }
};
