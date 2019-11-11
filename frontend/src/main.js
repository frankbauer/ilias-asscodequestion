import Vue from 'vue'
import App from './AppView.vue'

Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
}).$mount('#appview')
