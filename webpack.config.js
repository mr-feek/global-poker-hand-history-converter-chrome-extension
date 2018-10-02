let webpack = require('webpack'),
    path = require('path'),
    fileSystem = require('fs'),
    env = require('./utils/env'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    WriteFilePlugin = require('write-file-webpack-plugin');

// Load the secrets
const alias = {
};

const secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'));

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

if (fileSystem.existsSync(secretsPath)) {
    alias.secrets = secretsPath;
}

const options = {
    entry: {
        gp_override: path.join(__dirname, 'src', 'js', 'gp_override.js'),
        options: path.join(__dirname, 'src', 'js', 'options.js'),
        background: path.join(__dirname, 'src', 'js', 'background.js')
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js|$/,
                loader: 'babel-loader',
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
                exclude: /node_modules/,
            },
            {
                test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
                loader: 'file-loader?name=[name].[ext]',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/,
            },
            {
                test: require.resolve('zepto'),
                use: 'imports-loader?this=>window',
            },
        ],
    },
    resolve: {
        alias,
        modules: [
            path.resolve('./node_modules'),
            path.resolve('./src/js'),
        ],
        extensions: fileExtensions.map(extension => ("." + extension)).concat([".jsx", ".json", ".js", ".css"])
    },
    plugins: [
    // Clean the build folder
        new CleanWebpackPlugin(['build']),
    // Expose and write the allowed env vars on the compiled bundle
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        }),
        new CopyWebpackPlugin([{
            from: 'src/manifest.json',
            transform(content, path) {
                // Generates the manifest file using the package.json informations
                return Buffer.from(JSON.stringify({
                    description: process.env.npm_package_description,
                    version: process.env.npm_package_version,
                    ...JSON.parse(content.toString()),
                }));
            },
        }]),
        new CopyWebpackPlugin([{
            from: 'node_modules/flatpickr/dist/themes/dark.css',
        }]),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'popup.html'),
            filename: 'popup.html',
            chunks: ['popup'],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'options.html'),
            filename: 'options.html',
            chunks: ['options'],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'background.html'),
            filename: 'background.html',
            chunks: ['background'],
        }),
        new WriteFilePlugin(),
    ],
};

module.exports = options;
