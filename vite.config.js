const { defineConfig } = require('vite')
var path = require("path")

module.exports = defineConfig({
  build: {
    lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'glimeshBrowserApi',
        fileName: (format) => `my-component-lib.${format}.js`,
      },
  },
})