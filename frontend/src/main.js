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
import './plugins/codemirror';
import CodeBlocksManager from './lib/codeBlocksManager';

Vue.config.productionTip = false
CodeBlocksManager.find(document).mount();