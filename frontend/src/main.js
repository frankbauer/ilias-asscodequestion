import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import './plugins/codemirror';

Vue.config.productionTip = false


const allCodeBlockParents = document.querySelectorAll("codeblocks");
allCodeBlockParents.forEach(el => {
  let data = {
    ...el.dataset,
    blocks:[]
  };
  el.querySelectorAll("*").forEach(bl => {
    let block = {
      ...bl.dataset,
      type:bl.tagName,
      content:bl.textContent
    }    
    data.blocks.push(block);
  })
  
  new Vue({
    vuetify,
    render: function (h) { 
      const context = {
        props: { 
          language:data.language,
          id:data.question,
          blocks:data
        }
      };
      return h(App, context) 
    },
  }).$mount(el)
});


