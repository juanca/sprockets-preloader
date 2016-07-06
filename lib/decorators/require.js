module.exports = function requireDecorator(file, require = false) {
  return 'require(\'' + file + '\');';
};
