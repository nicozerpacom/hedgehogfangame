const path = require("path")

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.s[ac]ss?$/,
                use: [ "style-loader", "css-loader", "sass-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.(jpg|jpeg|webp|gif|ogg)$/,
                type: "asset/resource",
                exclude: /node_modules/s
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "game.js",
    }
};