// Takes a source and outputs the translated source

var fs = require('fs');
var path = require('path');
var vendorPath = 'vendor/assets/javascripts';
// var gemPath = require('child_process').spawnSync('rvm', ['gemdir']).output[1].toString();

function fileExists(path) {
  var fileExists = true;

    try {
      fileExists = fs.statSync(path).isFile();
    } catch (error) {
      fileExists = false;
    }

    return fileExists;
}

function resolveFilePath(context, requireFile) {
  var filePaths = [
    requireFile + '',
    requireFile + '.js',
    requireFile + '.coffee',
    requireFile + '/index.js',
    requireFile + '/index.coffee',
  ];

  return filePaths.find(fileExists);
}

function ensureRequire(context, requireFile) {
  var assetFilePath = path.join(context, requireFile);
  var assetFile = resolveFilePath(context, assetFilePath);
  if (assetFile) return assetFile;

  var vendorFilePath = path.join(vendorPath, requireFile);
  var vendorFile = resolveFilePath(context, vendorFilePath);
  if (vendorFile) return vendorFile;

  console.log('FILE UNRESOLVED:', requireFile);
  return undefined;
};

function transformRequire(context, requireFile) {
  var newRequireFilePath = ensureRequire(context, requireFile);
  if(newRequireFilePath) {
    newRequireFilePath = path.relative(context, newRequireFilePath);
    return "require('./" + newRequireFilePath + "');";
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

function transformRequireTree(context, requireDir) {
  var assetDir = path.join(context, requireDir);

  if (assetDir) {
    var files = fs.readdirSync(assetDir);
    return files.map(function(file) {
      var newPath = path.join(assetDir, file)
      newPath = path.relative(context, newPath);
      return "require('./" + newPath + "');";
    });
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
