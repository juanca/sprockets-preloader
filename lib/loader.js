var parsers = require('./directive-parsers.js');
var transformers = require('./directive-transformers.js');

// Avoid using `bundle` inside webpack by passing all gem paths as an env
if (!process.env.IMPORTANT_JS_GEM_PATHS) {
  require('./utils/bundler-check.js')();
}

function isJavaScript(file) {
  return /\.(js)|(coffee)$/.exec(file);
}

function isStylesheet(file) {
  return /\.(css)|(scss)|(sass)$/.exec(file);
}

module.exports = function(source) {
  this.cacheable();
  var context = this.context;

  if (isJavaScript(this.resourcePath)) {
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
  } else if (isStylesheet(this.resourcePath)) {
    return source;
  } else {
    console.error('sprockets-preloader: unknown extension', this.resourcePath)
    return source;
  }

  // This could be slow since it always goes through all the lines
  output = source.split('\n').reduce(lineParseReducer, []).join('\n');
  return output;
};
