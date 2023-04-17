const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env, _argv) {
    const outputConfig = {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: {
            name: 'mapglThreeJsPlugin',
            type: 'umd',
        },
    };

    const resolveConfig = {
        extensions: ['.ts', '.js'],
        // Fix warning
        // Multiple instances of Three.js being imported
        alias: {
            three: path.resolve('./node_modules/three'),
        },
    };

    const moduleConfig = {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            },
        ],
    };

    const productionPluginsConfig = [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'node_modules/three/examples/jsm/libs/draco',
                    to: 'libs/draco',
                },
            ],
        }),
    ];

    const developmentPluginsConfig = [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './demo/index.html',
            filename: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'node_modules/three/examples/jsm/libs/draco',
                    to: 'libs/draco',
                },
                {
                    from: 'demo/models',
                    to: 'models',
                },
            ],
        }),
    ];

    if (env.type === 'production') {
        return {
            mode: 'production',
            entry: './src/index.ts',
            output: outputConfig,
            resolve: resolveConfig,
            module: moduleConfig,
            plugins: productionPluginsConfig,
        };
    }

    if (env.type === 'development') {
        return {
            mode: 'development',
            entry: './demo/index.ts',
            output: outputConfig,
            resolve: resolveConfig,
            module: moduleConfig,
            plugins: developmentPluginsConfig,
            devtool: 'eval-source-map',
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
        };
    }

    if (env.type === 'demo') {
        return {
            mode: 'production',
            entry: './demo/index.ts',
            output: outputConfig,
            resolve: resolveConfig,
            module: moduleConfig,
            plugins: developmentPluginsConfig,
        };
    }
};
