var fs = require('fs');
var path = require('path');

var { importsDecorator, requireDecorator } = require('../decorators.js');
var { getFilesInDirectory } = require('../utils.js');
var pathIndication = 'assets/javascripts';

function transformFile(context, file) {
  var relativePath = path.relative(context, file);

  if (/.eco$/.exec(file)) {
    // There is a better way to do this...
    // - get root path for rails javascript assets from context
    var assetsRoot = context.slice(0, context.indexOf(pathIndication) + pathIndication.length);
    var relativePathFromAssetsRoot = path.relative(assetsRoot, file);

    var lines = [
      'window.JST = window.JST || {};',
      'window.JST[\'' + relativePathFromAssetsRoot + '\'] = ' + requireDecorator(importsDecorator(relativePath, { require: true }))
    ];

    return lines;
  } else {
    return requireDecorator(importsDecorator(relativePath, { require: true }));
  }
}

function getAllFilesInTree(context, directory) {
  return getFilesInDirectory(directory)
    .map(function(file) { return path.join(directory, file); })
    .reduce(function(requires, file) {
      if(fs.statSync(file).isDirectory()) {
        return requires.concat(getAllFilesInTree(context, file));
      } else {
        return requires.concat(transformFile(context, file));
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
