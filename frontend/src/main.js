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
import './plugins/tagger'
import CodeBlocksManager from './lib/codeBlocksManager';


Vue.config.productionTip = false
CodeBlocksManager.find(document).mount();

window.mountInElement = function(element){
  Vue.$hljs.$vue.processElements(element);
  Vue.$tagger.processElements(element);
  CodeBlocksManager.find(element).mount();
}