import Vue from 'vue'
import './plugins/codemirror';
import CodeBlocksManager from './lib/codeBlocksManager';

Vue.config.productionTip = false
CodeBlocksManager.find(document).mount();