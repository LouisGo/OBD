const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const cleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsParallelPlugin = require('webpack-uglify-parallel');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
const os = require('os');
const fs = require('fs');
const path = require('path');
const package = require('../package.json');
const SftpWebpackPlugin   = require('sftp-webpack-plugin');

fs.open('./build/env.js', 'w', function(err, fd) {
    const buf = 'export default "production";';
    fs.write(fd, buf, 0, buf.length, 0, function(err, written, buffer) {});
});

module.exports = merge(webpackBaseConfig, {
    output: {
        publicPath: '/',  // 修改 https://iv...admin 这部分为你的服务器域名 
        filename: '[name].[hash].js',
        chunkFilename: '[name].[hash].chunk.js',

    },
    plugins: [
        new cleanWebpackPlugin(['dist/*'], {
            root: path.resolve(__dirname, '/')
        }),
        new ExtractTextPlugin({
            filename: '[name].[hash].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            // name: 'vendors',
            // filename: 'vendors.[hash].js'
            name: ['vender-exten', 'vender-base'],
            minChunks: Infinity
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        // new UglifyJsParallelPlugin({
        //     workers: os.cpus().length,
        //     mangle: true,
        //     compressor: {
        //       warnings: false,
        //       drop_console: true,
        //       drop_debugger: true
        //      }
        // }),
        new CopyWebpackPlugin([
            {
                from: 'favicon.ico'
            },
            {
                from: 'src/styles/fonts',
                to: 'fonts'
            }
        ], {
            ignore: [
                'text-editor.vue'
            ]
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
            from: path.resolve(__dirname, '../static'),
            to: 'static',
            ignore: ['.*']
            }
        ]),
        new HtmlWebpackPlugin({
            title: 'iView admin v' + package.version,
            favicon: './favicon.ico',
            filename: './index.html',
            template: './src/template/index.ejs',
            inject: false
        }),
        new SftpWebpackPlugin({
            port: '21',
            host: '172.16.4.8',
            username: 'test',
            password: '123456',
            from: __dirname,
            to: '/OBD.Admin'
        })
    ]
});