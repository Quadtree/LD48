const path = require("path");

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'dist/main.js',
        path: path.resolve(__dirname, '..')
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    node: {
        fs: 'empty'
    }
};