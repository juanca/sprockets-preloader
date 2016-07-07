var path = require('path');
var childProcess = require('child_process');

var { importsDecorator, requireDecorator } = require('../decorators.js');
var { fileExists, resolveFilePath } = require('../utils.js');

var vendorPath = 'vendor/assets/javascripts';
var appPath = 'app/assets/javascripts';
var pathIndication = 'assets/javascripts';

function getAssetPath(context, requireFile) {
  var assetFilePath;

  if (requireFile[0] == '.') {
    assetFilePath = path.join(context, requireFile);
  } else {
    // There is a better way to do this...
    // - get root path for rails javascript assets from context
    var assetsRoot = context.slice(0, context.indexOf(pathIndication) + pathIndication.length);
    assetFilePath = path.join(assetsRoot, requireFile);
  }

  var assetFile = resolveFilePath(assetFilePath);
  if (assetFile) return path.relative(context, assetFile);
}

function getVendorAssetPath(context, requireFile) {
  var vendorFilePath = path.join(vendorPath, requireFile);
  var vendorFile = resolveFilePath(vendorFilePath);
  if (vendorFile) return path.relative(context, vendorFile);
}

function getGemAssetPath(context, requireFile) {
  var gem, assetPath;
  [gem, ...assetPath] = requireFile.split('/');

  var gemPath1 = childProcess.spawnSync('bundle', ['show', gem]).output[1].toString().trim();
  // Edge case for some gems (brainstem -> brainstem-js)
  var gemPath2 = childProcess.spawnSync('bundle', ['show', gem + '-js']).output[1].toString().trim();


  var gemPaths = [
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
  var gemFile = gemPaths
    .map(function(gemPath) { return resolveFilePath(gemPath); })
    .find(function(gemPath) { return gemPath; });

  if (gemFile) return path.relative(context, gemFile);
}

module.exports = function requireTransformer(context, requireFile) {
  var asset = getAssetPath(context, requireFile);
  if (asset) return requireDecorator(importsDecorator(asset, { require: true }));

  var vendorAsset = getVendorAssetPath(context, requireFile);
  if (vendorAsset) return requireDecorator(importsDecorator(vendorAsset));

  var gemAsset = getGemAssetPath(context, requireFile);
  if (gemAsset) return requireDecorator(importsDecorator(gemAsset, { require: true }));

  console.log('FILE UNRESOLVED:', context, requireFile);
  return ''; // Unknown file: perhaps a weird gem require or it's just missing
};
