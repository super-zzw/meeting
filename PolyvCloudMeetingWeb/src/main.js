import Vue from 'vue';
import App from './App';
import router from './router/router';
import store from './store/root';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
