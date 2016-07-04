var fs = require('fs');
var path = require('path');
var importsLoader = path.join(__dirname, '../../node_modules/imports-loader');

var { getFilesInDirectory } = require('../utils.js');
var importsOnlyRequire = importsLoader +
  '?module=>undefined'  +
  ',exports=>undefined' +
  ',define=>undefined'  +
  ',this=>window!';

module.exports = function requireDirectoryTransformer(context, requireDir) {
  var assetDir = path.join(context, requireDir);

  if (assetDir) {
    return getFilesInDirectory(assetDir)
      .map(function(file) { return path.join(assetDir, file); })
      .filter(function(file) { return fs.statSync(file).isFile(); })
      .map(function(file) { return path.relative(context, file); })
      .map(function(file) { return "require('" + importsOnlyRequire + "./" + file + "');"; });
  } else {
    console.error('sprockets-preloader: unable to find directory ', requireDir, ' in ', context);
    return [];
  }
};
