// Takes a source and outputs the translated source

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var vendorPath = 'vendor/assets/javascripts';
var importsLoader = path.join(__dirname, '../node_modules/imports-loader');
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

function fileExists(path) {
  var fileExists = true;

  try {
    fileExists = fs.statSync(path).isFile();
  } catch (error) {
    fileExists = false;
  }

  return fileExists;
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

function ensureRequire(context, requireFile) {
  var assetFilePath;

  if (requireFile[0] == '.') {
    assetFilePath = path.join(context, requireFile);
  } else {
    // There is a better way to do this...
    // - get root path for rails javascript assets from context
    var assetsRoot = 'app/assets/javascripts'
    assetsRoot = context.slice(0, context.indexOf(assetsRoot) + assetsRoot.length)
    assetFilePath = path.join(assetsRoot, requireFile);
  }

  var assetFile = resolveFilePath(assetFilePath);
  if (assetFile) return importsOnlyRequire + './' + path.relative(context, assetFile);

  var vendorFilePath = path.join(vendorPath, requireFile);
  var vendorFile = resolveFilePath(vendorFilePath);
  if (vendorFile) return importsNothing + './' + path.relative(context, vendorFile);


  var gemPath1 = childProcess.spawnSync('bundle', ['show', requireFile]).output[1].toString().trim();
  // Edge case for some gems (brainstem -> brainstem-js)
  var gemPath2 = childProcess.spawnSync('bundle', ['show', requireFile + '-js']).output[1].toString().trim();
  gemPaths = [
    path.join(gemPath1, 'vendor/assets/javascripts', requireFile),
    path.join(gemPath1, 'vendor/assets/javascripts'),
    path.join(gemPath2, 'vendor/assets/javascripts', requireFile),
    path.join(gemPath2, 'vendor/assets/javascripts'),
  ];

  // Gem assets can contain other sprocket directives which will invoke sprockets-preloader again
  // The additional requires will follow the `assetFile` code flow which means `require` cannot be turned off
  gemFile = gemPaths
    .map(function(gemPath) { return resolveFilePath(gemPath); })
    .find(function(gemPath) { return gemPath; });
  if (gemFile) return importsOnlyRequire + './' + path.relative(context, gemFile);

  console.log('FILE UNRESOLVED:', context, requireFile);
  return undefined;
};

function transformRequire(context, requireFile) {
  var newRequireFilePath = ensureRequire(context, requireFile);
  if(newRequireFilePath) {
    return "require('" + newRequireFilePath + "');";
  } else {
    return ''; // Unknown file: perhaps a weird gem require or it's just missing
  }
}

function parseRequireDirective(line) {
  var requireDirectives = [
      /(\/\/=)\s*(require)\s+(\S+)/,
      /(#=)\s*(require)\s+(\S+)/,
    ];

  return requireDirectives
    .map(function(requireDirective) { return requireDirective.exec(line); })
    .find(function(matches) { return matches });
}

function getAllFilesInTree(context, directory) {
  var files = fs.readdirSync(directory);

  return files.filter(function(file) {
    // Sad edge cases...
    var isErb = /.erb/.exec(file);
    var isMd = /.md/.exec(file);

    return !(isErb || isMd);
  }).reduce(function(requires, file) {
    var newPath = path.join(directory, file)

    if(fs.statSync(newPath).isDirectory()) {
      return requires.concat(getAllFilesInTree(context, newPath));
    } else {
      newPath = path.relative(context, newPath);
      return requires.concat(["require('./" + newPath + "');"]);
    }
  }, []);
}

function transformRequireTree(context, requireDir) {
  var assetDir = path.join(context, requireDir);

  if (assetDir) {
    return getAllFilesInTree(context, assetDir);
  } else {
    console.log('TREE UNRESOLVED:', context, requireDir);
    return [];
  }
}

function parseRequireTreeDirective(line) {
  var requireTreeDirectives = [
    /(\/\/=)\s*(require_tree)\s+(\S+)/,
    /(#=)\s*(require_tree)\s+(\S+)/,
  ];

  return requireTreeDirectives
    .map(function(requireTreeDirective) { return requireTreeDirective.exec(line); })
    .find(function(matches) { return matches });
}

module.exports = function(source) {
  this.cacheable();
  var context = this.context;

  var lineParseReducer = function(outputLines, line) {
    var newLine;

    var requireMatches = parseRequireDirective(line);
    if (requireMatches) return outputLines.concat(transformRequire(context, requireMatches[3]));

    var requireTreeMatches = parseRequireTreeDirective(line);
    if (requireTreeMatches) return outputLines.concat(transformRequireTree(context, requireTreeMatches[3]));

    return outputLines.concat(line);
  };

  // This could be slow since it always goes through all the lines
  output = source.split('\n').reduce(lineParseReducer, []).join('\n');
  return output;
};
