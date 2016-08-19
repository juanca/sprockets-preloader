var path = require('path');
var importsLoader = require.resolve('imports-loader');

module.exports = function importsDecorator(file, bypass) {
  bypass = bypass || {};
  var defaults = {
    define: undefined,
    exports: undefined,
    module: undefined,
    require: undefined,
    this: 'window'
  };

  var imports = Object.keys(defaults)
    .filter(function (name) { return !bypass[name]; })
    .map(function(name) { return name + '=>' + defaults[name] })
    .join(',');

  return importsLoader + '?' + imports + '!./' + file;
};
