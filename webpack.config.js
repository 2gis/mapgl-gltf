const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env, _argv) {
    const outputConfig = {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: {
            name: 'mapglGltfPlugin',
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
                options: {
                    configFile: env.type === 'test' ? 'tsconfig.test.json' : 'tsconfig.json',
                },
            },
            // For CSS modules
            {
                test: /\.module\.css$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName:
                                    env.type === 'production'
                                        ? 'mapgl_[hash:base64]'
                                        : '[path][name]__[local]',
                            },
                        },
                    },
                ],
            },
        ],
    };

    const productionPluginsConfig = [new CleanWebpackPlugin()];

    const developmentPluginsConfig = [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './demo/index.html',
            filename: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
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

    if (env.type === 'test') {
        return {
            mode: 'production',
            entry: './test/index.ts',
            output: {
                path: path.resolve(__dirname, 'dist/'),
                filename: 'test.js',
            },
            resolve: resolveConfig,
            module: moduleConfig,
            plugins: [
                new CleanWebpackPlugin(),
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: 'demo/models',
                            to: 'models',
                        },
                        {
                            from: 'test/index.html',
                            to: 'test.html',
                        },
                    ],
                }),
            ],
        };
    }
};
