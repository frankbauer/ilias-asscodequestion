String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.replaceRec = function (pattern, replacement) {
  var newstr = this.replace(pattern, replacement);
  if (newstr == this)
      return newstr;
  return newstr.replaceRec(pattern, replacement);
};

import Vue from 'vue'
import './plugins/quasar'
import './plugins/codemirror';
import './plugins/codeBlocks';
import './plugins/compilerState';
import './plugins/codemirror';
import './plugins/highlight'
import CodeBlocksManager from './lib/codeBlocksManager';


Vue.config.productionTip = false
Vue.$hljs.$vue.processElements();
CodeBlocksManager.find(document).mount();
