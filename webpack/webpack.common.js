const path = require("path");

module.exports = {
    entry: './src/game.ts',
    output: {
        filename: 'dist/game.js',
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