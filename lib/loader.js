// Takes a source and outputs the translated source

var fs = require('fs');
var path = require('path');

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
    requireFile + '/index.coffee'
  ];

  var filePath = filePaths.find(fileExists);

  if(filePath) {
    console.log('FILE RESOLVED:', filePath);
  } else {
    console.log('FILE UNRESOLVED:', requireFile);
  }

  return filePath;
}

function ensureRequire(context, requireFile) {
  var requireFilePath = path.join(context, requireFile);
  return resolveFilePath(context, requireFilePath);
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

    var requireDirective = /(\/\/=)\s*(require)\s+(\S+)/;
    var requireMatches = requireDirective.exec(line);

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
