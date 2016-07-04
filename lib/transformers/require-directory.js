var fs = require('fs');
var path = require('path');
var importsLoader = path.join(__dirname, '../../node_modules/imports-loader');

var { getFilesInDirectory } = require('../utils.js');
var importsNothing = importsLoader +
  '?module=>undefined'  +
  ',exports=>undefined' +
  ',define=>undefined'  +
  ',require=>undefined' +
  ',this=>window!';
var importsOnlyRequire = importsLoader +
  '?module=>undefined'  +
  ',exports=>undefined' +
  ',define=>undefined'  +
  ',this=>window!';

function getAllFilesInTree(context, directory) {
  return getFilesInDirectory(directory).reduce(function(requires, file) {
    var newPath = path.join(directory, file);

    if(fs.statSync(newPath).isDirectory()) {
      return requires;
    } else {
      newPath = path.relative(context, newPath);
      return requires.concat(["require('" + importsOnlyRequire + "./" + newPath + "');"]);
    }
  }, []);
}

module.exports = function requireDirectoryTransformer(context, requireDir) {
  var assetDir = path.join(context, requireDir);

  if (assetDir) {
    return getAllFilesInTree(context, assetDir);
  } else {
    console.log('DIRECTORY UNRESOLVED:', context, requireDir);
    return [];
  }
};
