import Vue from "vue";
import App from "./App.vue";
/* 引入element组件 */
import "element-ui/lib/theme-chalk/index.css";
import ElementUI from "element-ui";
Vue.use(ElementUI);
/* 引入自定义组件 */
import wjUI from "../packages/index";
Vue.use(wjUI);

import router from './router/index'  

Vue.config.productionTip = false;
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
