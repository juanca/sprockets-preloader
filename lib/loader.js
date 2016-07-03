var parsers = require('./directive-parsers.js');
var transformers = require('./directive-transformers.js');


module.exports = function(source) {
  this.cacheable();
  var context = this.context;

  var lineParseReducer = function(outputLines, line) {
    var newLine;

    var requireMatches = parsers.require(line);
    if (requireMatches) return outputLines.concat(transformers.require(context, requireMatches[3]));

    var requireTreeMatches = parsers.requireTree(line);
    if (requireTreeMatches) return outputLines.concat(transformers.requireTree(context, requireTreeMatches[3]));

    return outputLines.concat(line);
  };

  // This could be slow since it always goes through all the lines
  output = source.split('\n').reduce(lineParseReducer, []).join('\n');
  return output;
};
