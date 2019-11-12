<template>
  <v-app>
    <v-content>
      <CodeBlocks :blocks="blocks.blocks" :language="blocks.language" :blockid="blocks.id" :compiler="blocks.compiler"/>
    </v-content>
  </v-app>
</template>

<script>
import CodeBlocks from './components/CodeBlocks';
import Vue from 'vue'

Vue.prototype.SEVERITY_ERROR = 2;
Vue.prototype.SEVERITY_WARNING = 1;
Vue.prototype.$CodeBlock = {
  format_info:function(text){
    return '<span style="color:green">'+text+'</span>';
  },
  format_error:function(text){
    return '<span style="color:red">'+text+'</span>';
  }
}

Vue.prototype.$compilerState = new Vue({
  data: function(){
      return {
        globalStateHidden:true,
        globalStateMessage:"",
        runButtonForceHide:true,
      }
    },
    methods:{
        hideGlobalState(){  
          this.displayGlobalState(null);
        },
        setAllRunButtons(what){
          this.runButtonForceHide = !what;
        },
        displayGlobalState(message){
          this.globalStateHidden = message===null || message===undefined || message==="";          
          this.globalStateMessage = message;
        }
    }
})

export default {
  name: 'App',

  props: ['blocks'],

  components: {
    CodeBlocks,
  },

  data: () => ({
    
  }),
  computed:{
    
  }
};
</script>

<style lang="sass">
  #app
    margin-bottom: 16px
    background-color: rgba(1,1,1,0)
    .v-application--wrap
      min-height: 1vh!important
</style>
