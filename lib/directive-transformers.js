module.exports = {
  require: require('./transformers/require.js'),
  requireTree: require('./transformers/require-tree.js'),
  requireDirective: require('./transformers/require-directory.js'),
  requireSelf: require('./transformers/require-self.js'),
};
