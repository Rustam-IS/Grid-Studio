const { MonacoEditorWebpackPlugin } = require('monaco-editor-webpack-plugin')

module.exports = {
    transpileDependencies: true,
    configureWebpack: {
        // plugins: [
        //     new MonacoEditorWebpackPlugin()
        // ]
    }
}
