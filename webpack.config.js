'use strict';

const webpack           = require('webpack');
const path              = require('path');
const buildFailer       = require('webpack-fail-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const plugins = [];

// PROD ONLY
if (process.env.NODE_ENV === 'production') {
    plugins.push(buildFailer);
    plugins.push(new webpack.optimize.UglifyJsPlugin());
}

plugins.push(new HtmlWebpackPlugin({
    title    : "GAMaaS",
    filename : 'index.html',
    template : path.resolve(__dirname, "src/template") + '/index.ejs',
    inject   : 'body',
    window   : {
        env : {}
    }
}));

let config = {
    entry  : ['./src/index.js'],
    devServer : {
        port : 8090
    },
    output : {
        filename      : 'index.js',
        path          : path.resolve(__dirname, 'dist'),
        library       : "gamaas",
        libraryTarget : "umd"
    },
    watch        : true,
    watchOptions : {
        aggregateTimeout : 300,
        exclude          : /node_modules/
    },
    node : {
        fs : 'empty'
    },
    devtool : '#cheap-inline-source-map',
    module  : {
        rules : [
            {
                test    : /\.js$/,
                exclude : /node_modules/,
                use     : [{
                    loader  : 'babel-loader',
                    options : {
                        presets : ['es2015', 'flow']
                    }
                }]
            },
            {
                test : /\.gif$/,
                use  : [{
                    loader  : 'url-loader',
                    options : {
                        limit    : 10000,
                        mimetype : 'image/gif'
                    }
                }]
            },
            {
                test : /\.jpg$/,
                use  : [{
                    loader  : 'url-loader',
                    options : {
                        limit    : 10000,
                        mimetype : 'image/jpg'
                    }
                }]
            },
            {
                test : /\.png$/,
                use  : [{
                    loader  : 'url-loader',
                    options : {
                        limit    : 10000,
                        mimetype : 'image/png'
                    }
                }]
            }
        ]
    },
    plugins : plugins,
    resolve : {
        extensions : ['.js', '.css', '.scss']
    }
};

module.exports = config;
