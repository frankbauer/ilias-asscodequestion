const path = require("path")
     ,conf = require('./package.json')

module.exports = {
  publicPath: "Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/codeblocks/" + conf.version + '/',
  filenameHashing: false,
  
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },

  transpileDependencies: [
    'quasar'
  ],
	configureWebpack: {
    
   
    
  }
}
