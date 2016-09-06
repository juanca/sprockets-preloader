module.exports = function() {
  var bundleCheck = require('child_process').spawnSync('bundle', ['check']);

  var output = bundleCheck.output.slice(1)
    .map(function(buffer) { return buffer.toString(); })
    .join('\n');

  if (bundleCheck.indexOf('The Gemfile\'s dependencies are satisfied') === -1) {
    throw new Error(output || 'Bundler is not properly configured (and has no error description)');
  }
};
