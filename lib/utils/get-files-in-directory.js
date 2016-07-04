var fs = require('fs');

module.exports = function getFilesInDirectory(directory) {
  var files = fs.readdirSync(directory);

  return files.filter(function(file) {
    // Sad edge cases...
    var isErb = /.erb/.exec(file);
    var isMd = /.md/.exec(file);

    return !(isErb || isMd);
  });
};
