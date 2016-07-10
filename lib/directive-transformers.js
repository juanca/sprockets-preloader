module.exports = {
  require: require('./transformers/require.js'),
  requireTree: require('./transformers/require-tree.js'),
  requireDirectory: require('./transformers/require-directory.js'),
  requireSelf: require('./transformers/require-self.js'),
};
