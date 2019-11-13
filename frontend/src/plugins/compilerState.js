import Vue from 'vue'

Vue.prototype.SEVERITY_ERROR = 2;
Vue.prototype.SEVERITY_WARNING = 1;

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