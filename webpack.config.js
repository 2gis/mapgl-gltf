const path = require('path');
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
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                    },
                ],
            },
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
            ],
            devServer: {
                compress: true,
                port: 3700,
                client: {
                    overlay: false,
                },
            },
            watch: true,
        };

    }
}
