// webpack.config.js
const path = require('path')
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        main: './main.js',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js',
    },
    devServer: {
        open: true,
        watchFiles: [
            '**/*.*',
            '!node_modules'
        ],
        hot: true,
        historyApiFallback: false,
        port: 3000,
        static: [
            path.resolve('./'),
        ]
    },

    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: `Демо`,
            inject: true,
            template: './main.html',
            scriptLoading: 'defer',
            // favicon: './favicon.ico',
        }),
    ]
}
