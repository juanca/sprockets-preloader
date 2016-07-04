var fs = require('fs');

module.exports = function fileExists(path) {
  var fileExists = true;

  try {
    fileExists = fs.statSync(path).isFile();
  } catch (error) {
    fileExists = false;
  }

  return fileExists;
};
