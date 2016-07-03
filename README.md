# Sprockets Pre-Loader for Webpack

- Easily translate sprockets require directives into JavaScript module dependencies
  - Supports: `require`, `require_tree`, `require_directory`, and `require_self`
  - Supports vendor assets in `vendor/assets/javascripts`
  - Supports gem assets

- Useful for migrating a Rails project to Webpack module bundling


## Using `sprocket-preloader`

- Recommended: [`webpack-rails`](https://github.com/mipearson/webpack-rails) gem to integrate webpack asset helpers in Rails
- Make `non_webpack_compatible_before_webpack` sprocket asset for all `.erb` assets
- Make `non_webpack_compatible_after_webpack` sprocket asset for all `.erb` assets dependent on webpack assets
- Add [`coffee-loader`](https://github.com/webpack/coffee-loader) to parse CoffeeScript files


## Configuration examples

`webpack.config.js` should contain something similarly to:

```javascript
  module: {
    preLoaders: [{
      loader: path.join(__dirname, '../node_modules', 'sprockets-preloader'),
    }],
    loaders: [{
      test: /\.coffee$/, loader: path.join(__dirname, '../node_modules', 'coffee-loader'),
    }, {
      test: /\.eco$/, loader: 'eco-loader'
    }]
  }
```

`application.html.erb` should contain something similarly to:

```erb
  <%= javascript_include_tag 'non_webpack_compatible_before_webpack' %>
  <%= javascript_include_tag *webpack_asset_paths('application') %>
  <%= javascript_include_tag 'non_webpack_compatible_after_webpack' %>
```


## Issues

- Is there a good enough ECO loader to mimic Rails eco compiler behavior? Global `JST` object is required.


### Note: This is not an permanent solution to using JavaScript module dependencies.

Please dedicate time to converting files manually once all dependencies are working with webpack
(e.g. development, test, production)
