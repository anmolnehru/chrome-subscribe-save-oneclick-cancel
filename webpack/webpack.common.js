/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: {
        content_script: path.join(srcDir, 'content_script.ts'),
    },
    output: {
        path: path.join(__dirname, '../dist/js'),
        filename: '[name].js',
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks(chunk) {
                return chunk.name !== 'background';
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: '.', to: '../', context: 'public' }],
            options: {},
        }),
    ],
};
