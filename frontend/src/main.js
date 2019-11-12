import Vue from 'vue'
import App from './App.vue'
import './plugins/codemirror';
import CodeBlocksManager from './lib/codeBlocksManager';

Vue.config.productionTip = false
CodeBlocksManager.find(App, Vue, document).mount();