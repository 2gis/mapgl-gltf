const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env) {
    const mode = env.production ? 'production' : 'development';

    if (mode === 'production') {
        return {
            mode,
            entry: './src/index.ts',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: 'bundle.js',
                library: {
                    name: 'mapglThreeJsPlugin',
                    type: 'umd',
                },
            },
            resolve: {
                extensions: ['.ts', '.js'],
                // Fix warning
                // Multiple instances of Three.js being imported
                alias: {
                    three: path.resolve('./node_modules/three')
                },
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                    },
                ],
            },
            plugins: [
                new CleanWebpackPlugin(),
                new HtmlWebpackPlugin({
                    template: './demo/index.html',
                    filename: 'index.html',
                }),
                new CopyWebpackPlugin({
                    patterns: [{
                        from: 'static',
                        to: 'static',
                    }, {
                        from: 'demo/models',
                        to: 'models'
                    }],
                })
            ],
        };
    }

    if (mode === 'development') {
        return {
            mode,
            entry: './demo/index.ts',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: 'bundle.js',
                library: {
                    type: 'umd',
                },
            },
            resolve: {
                extensions: ['.ts', '.js'],
                // Fix warning
                // Multiple instances of Three.js being imported
                alias: {
                    three: path.resolve('./node_modules/three')
                },
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                    },
                ],
            },
            plugins: [
                new CleanWebpackPlugin(),
                new HtmlWebpackPlugin({
                    template: './demo/index.html',
                    filename: 'index.html',
                }),
                new CopyWebpackPlugin({
                    patterns: [{
                        from: 'static',
                        to: 'static',
                    }, {
                        from: 'demo/models',
                        to: 'models'
                    }],
                })
            ],
            devServer: {
                compress: true,
                port: 3700,
                client: {
                    overlay: false,
                },
                devMiddleware: {
                    writeToDisk: true,
                },
            },
            watch: true,
        };

    }
}
