var parsers = require('../directive-parsers.js');

module.exports = function requireSelfTransformer(source) {
  var lineParseReducer = function(outputLines, line) {
    var requireMatches = parsers.require(line);
    if (requireMatches) return outputLines;

    var requireTreeMatches = parsers.requireTree(line);
    if (requireTreeMatches) return outputLines;

    var requireDirectoryMatches = parsers.requireDirectory(line);
    if (requireDirectoryMatches) return outputLines;

    var requireSelfMatches = parsers.requireSelf(line);
    if (requireSelfMatches) return outputLines;

    return outputLines.concat(line);
  };

  // This could be slow since it always goes through all the lines
  return source.split('\n').reduce(lineParseReducer, []);
};
