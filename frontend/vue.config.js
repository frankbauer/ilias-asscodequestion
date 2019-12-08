const path = require("path");

module.exports = {
  publicPath: "Customizing/global/plugins/Modules/TestQuestionPool/Questions/assCodeQuestion/frontend/dist/",
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
