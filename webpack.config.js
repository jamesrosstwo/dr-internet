const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Crx = require('crx-webpack-plugin');
const { version } = require('./package.json');

module.exports = {
    entry: {
        popup: './src/js/popup.js',
        background: './src/js/background.js',
        'bundle': './src/js/bundle.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },

    cache: true,
    devtool: 'eval-cheap-module-source-map',

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ],
        loaders: [
            {
                test: /\.js?$/,
                include: [path.resolve(__dirname, 'src')],
                loader: 'babel-loader'
            }
        ]
    },

    resolve: {
        alias: {
            vue: 'dist/vue.js'
        }
    },

    plugins: [
        new CopyWebpackPlugin([
            { from: './manifest.json' },
            { from: './src/images' },
            { from: './src/views' },
            { from: './src/css' }
        ])
    ]
};
