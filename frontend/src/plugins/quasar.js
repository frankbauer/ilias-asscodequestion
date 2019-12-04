import Vue from 'vue'

import '../styles/quasar.styl'
import '@quasar/extras/material-icons/material-icons.css'

import '@quasar/extras/animate/fadeInUp.css'
import '@quasar/extras/animate/fadeInDown.css'
import '@quasar/extras/animate/fadeOutUp.css'
import '@quasar/extras/animate/fadeOutDown.css'

import '@quasar/extras/animate/fadeIn.css'
import '@quasar/extras/animate/fadeOut.css'

import '@quasar/extras/animate/zoomInDown.css'
import '@quasar/extras/animate/zoomInUp.css'


import  Quasar  from 'quasar'

Vue.use(Quasar, {
  config: {},
  components: { /* not needed if importStrategy is not 'manual' */ },
  directives: { /* not needed if importStrategy is not 'manual' */ },
  plugins: {
  }
 })