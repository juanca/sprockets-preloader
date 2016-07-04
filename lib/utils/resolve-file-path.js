var fileExists = require('./file-exists.js');

module.exports = function resolveFilePath(requireFile) {
  var filePaths = [
    requireFile + '',
    requireFile + '.js',
    requireFile + '.coffee',
    requireFile + '.js.coffee',
    requireFile + '.jst.eco',
    requireFile + '/index.js',
    requireFile + '/index.coffee',
  ];

  return filePaths.find(fileExists);
}
