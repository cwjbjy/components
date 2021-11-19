import Vue from 'vue'
import App from './App.vue' 

import wjUI from '../packages/index'

Vue.use(wjUI)

Vue.config.productionTip = false
new Vue({
  render: h => h(App),
}).$mount('#app')
