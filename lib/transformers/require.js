var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var { fileExists } = require('../utils');

var vendorPath = 'vendor/assets/javascripts';
var appPath = 'app/assets/javascripts';
var pathIndication = 'assets/javascripts';
var importsLoader = path.join(__dirname, '../../node_modules/imports-loader');
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

function ensureRequire(context, requireFile) {
  var assetFilePath;

  if (requireFile[0] == '.') {
    assetFilePath = path.join(context, requireFile);
  } else {
    // There is a better way to do this...
    // - get root path for rails javascript assets from context
    assetsRoot = context.slice(0, context.indexOf(pathIndication) + pathIndication.length);
    assetFilePath = path.join(assetsRoot, requireFile);
  }

  var assetFile = resolveFilePath(assetFilePath);
  if (assetFile) return importsOnlyRequire + './' + path.relative(context, assetFile);

  var vendorFilePath = path.join(vendorPath, requireFile);
  var vendorFile = resolveFilePath(vendorFilePath);
  if (vendorFile) return importsNothing + './' + path.relative(context, vendorFile);


  var gem, assetPath;
  [gem, ...assetPath] = requireFile.split('/');

  var gemPath1 = childProcess.spawnSync('bundle', ['show', gem]).output[1].toString().trim();
  // Edge case for some gems (brainstem -> brainstem-js)
  var gemPath2 = childProcess.spawnSync('bundle', ['show', gem + '-js']).output[1].toString().trim();


  gemPaths = [
    path.join(gemPath1, vendorPath, requireFile),
    path.join(gemPath1, appPath, requireFile),
    path.join(gemPath1, vendorPath),
    path.join(gemPath1, appPath),
    path.join(gemPath2, vendorPath, requireFile),
    path.join(gemPath2, appPath, requireFile),
    path.join(gemPath2, vendorPath),
    path.join(gemPath2, appPath),
  ];

  // Gem assets can contain other sprocket directives which will invoke sprockets-preloader again
  // The additional requires will follow the `assetFile` code flow which means `require` cannot be turned off
  gemFile = gemPaths
    .map(function(gemPath) { return resolveFilePath(gemPath); })
    .find(function(gemPath) { return gemPath; });
  if (gemFile) return importsOnlyRequire + './' + path.relative(context, gemFile);

  console.log('FILE UNRESOLVED:', context, requireFile);
  return undefined;
}

function resolveFilePath(requireFile) {
  var filePaths = [
    requireFile + '',
    requireFile + '.js',
    requireFile + '.js.coffee',
    requireFile + '.coffee',
    requireFile + '/index.js',
    requireFile + '/index.coffee',
    requireFile + '.jst.eco',
  ];

  return filePaths.find(fileExists);
}

module.exports = function requireTransformer(context, requireFile) {
  var newRequireFilePath = ensureRequire(context, requireFile);
  if(newRequireFilePath) {
    return "require('" + newRequireFilePath + "');";
  } else {
    return ''; // Unknown file: perhaps a weird gem require or it's just missing
  }
};
