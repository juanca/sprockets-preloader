# Sprockets Pre-Loader for Webpack

[![npm version](https://img.shields.io/npm/v/sprockets-preloader.svg?style=flat-square)](https://www.npmjs.com/package/sprockets-preloader)
[![npm downloads](https://img.shields.io/npm/dm/sprockets-preloader.svg?style=flat-square)](https://www.npmjs.com/package/sprockets-preloader)

Easily translate sprockets require directives into JavaScript module dependencies.
Useful for migrating a Rails project to Webpack module bundling.


## Supports

- `require`, `require_tree`, `require_directory`, and `require_self` sprocket directives
- Vendor assets in `vendor/assets/javascripts`
- Gem assets (resulting from `bundle show <gem>`)
- JST Eco assets


## Using `sprocket-preloader`

### Installation

    npm install --save sprocket-preloader

### Configuration

Include as a `preLoader`, e.g.

```javascript
module: {
  preLoaders: [
    { loader: require.resolve('sprockets-preloader') },
  ],
}
```

_should avoid `.erb.` and `.md` files_

### Tips

- Recommended: [`webpack-rails`](https://github.com/mipearson/webpack-rails) gem to integrate webpack asset helpers in Rails
- Make `non_webpack_compatible_before_webpack` sprocket asset for all `.erb` assets
- Make `non_webpack_compatible_after_webpack` sprocket asset for all `.erb` assets dependent on webpack assets
- Note: any gem's `erb` dependencies should be included in either of the above files
- Add [`coffee-loader`](https://www.npmjs.com/package/coffee-loaderr) to parse CoffeeScript files
- Add [`eco-loader`](https://www.npmjs.com/package/eco-loader) to parse Eco files
- Top-level `var` expressions actually polluted the global closure.
Removing the `var` keyword should suffice as a transition remedy.


### Another configuration example

`webpack.config.js` should contain something similarly to:

```javascript
module: {
  preLoaders: [
    { loader: require.resolve('sprockets-preloader') },
  ],
  loaders: [
    { test: /\.coffee$/, loader: require.resolve('coffee-loader') },
    { test: /\.eco$/, loader: require.reseolve('eco-loader') },
  ],
}
```

`application.html.erb` should contain something similarly to:

```erb
  <%= javascript_include_tag 'non_webpack_compatible_before_webpack' %>
  <%= javascript_include_tag *webpack_asset_paths('application') %>
  <%= javascript_include_tag 'non_webpack_compatible_after_webpack' %>
```


## Note: This is not an permanent solution to using JavaScript module dependencies.

Please dedicate time to converting files manually once all dependencies are working with webpack
(e.g. development, test, production)
Easiest to move gem and vendor dependencies as module dependencies (from NPM or the like).
For each JavaScript file in the Rails assets manifest, convert to module dependencies.
Perhaps this can be released as a script to convert require directives.
