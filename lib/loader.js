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
    return '// WHAT IS THIS?!:' + requireFile;
  }
}

module.exports = function(source) {
  var context = this.context;

  var lineParseReducer = function(outputLines, line) {
    var newLine;

    var requireDirectives = [
      /(\/\/=)\s*(require)\s+(\S+)/,
      /(#=)\s*(require)\s+(\S+)/,
    ];

    var requireMatches = requireDirectives
      .map(function(requireDirective) { return requireDirective.exec(line); })
      .find(function(matches) { return matches });

    if (requireMatches) {
      newLine = transformRequire(context, requireMatches[3]);
    } else {
      newLine = line;
    }

    return outputLines.concat(newLine);
  };

  // This could be slow since it always goes through all the lines
  output = source.split('\n').reduce(lineParseReducer, []).join('\n');
  return output;
};
