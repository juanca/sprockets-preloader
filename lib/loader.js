var parsers = require('./directive-parsers.js');
var transformers = require('./directive-transformers.js');
var bundleCheck = childProcess.spawnSync('bundle', ['check']).output[1].toString().trim();

if (bundleCheck != 'The Gemfile\'s dependencies are satisfied') {
  throw new Error(bundleCheck);
}

module.exports = function(source) {
  this.cacheable();
  var context = this.context;

  var lineParseReducer = function(outputLines, line) {
    var requireMatches = parsers.require(line);
    if (requireMatches) return outputLines.concat(transformers.require(context, requireMatches[3]));

    var requireTreeMatches = parsers.requireTree(line);
    if (requireTreeMatches) return outputLines.concat(transformers.requireTree(context, requireTreeMatches[3]));

    var requireDirectoryMatches = parsers.requireDirectory(line);
    if (requireDirectoryMatches) return outputLines.concat(transformers.requireDirectory(context, requireDirectoryMatches[3]));

    var requireSelfMatches = parsers.requireSelf(line);
    if (requireSelfMatches) return outputLines.concat(transformers.requireSelf(source));

    return outputLines.concat(line);
  };

  // This could be slow since it always goes through all the lines
  output = source.split('\n').reduce(lineParseReducer, []).join('\n');
  return output;
};
