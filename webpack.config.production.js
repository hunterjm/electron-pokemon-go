import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

const config = merge(baseConfig, {
  entry: './app/index',

  module: {
    loaders: [{
      test: /\main.less$/,
      loader: ExtractTextPlugin.extract(
        // activate source maps via loader query
        'css?sourceMap!' +
        'less?sourceMap'
      )
    }]
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin('style.css', { allChunks: true }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  ],

  target: 'electron-renderer'
});

export default config;
