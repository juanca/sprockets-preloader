var fs = require('fs');
var path = require('path');

var { getFilesInDirectory } = require('../utils.js');
var { importsDecorator } = require('../decorators.js');

module.exports = function requireDirectoryTransformer(context, requireDir) {
  var assetDir = path.join(context, requireDir);

  if (assetDir) {
    return getFilesInDirectory(assetDir)
      .map(function(file) { return path.join(assetDir, file); })
      .filter(function(file) { return fs.statSync(file).isFile(); })
      .map(function(file) { return path.relative(context, file); })
      .map(function(file) { return "require('" + importsDecorator(file, { require: true }) + "');"; });
  } else {
    console.error('sprockets-preloader: unable to find directory ', requireDir, ' in ', context);
    return [];
  }
};
