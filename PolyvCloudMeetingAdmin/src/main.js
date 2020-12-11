import Vue from 'vue';
import Notifications from 'vue-notification';

import App from './App';
import router from './router/router';
import store from './store/root';

import notifyMethod from '@/components/notification/method';
import errorLog from '@/assets/common/utils/error-log';

// import Service from '@/assets/common/utils/service'; // 获取到userInfo之后初始化

// 限制输入框内容为正整数
// 注意：1.type类型必须为text 2.返回字符串类型
Vue.directive('limitNaturalNumber', {
  inserted(el) {
    el.addEventListener('keyup', () => {
      el.value = el.value.replace(/[^\d]/g, '');
    });
  }
});

// notification
Vue.use(Notifications);
notifyMethod(Vue.prototype.$notify);
Vue.prototype.$notify.codeError = function codeError(code, duration) {
  Vue.prototype.$notify.errorMessage(errorLog(code), duration);
};

Vue.config.productionTip = false;

// const yiZhiEmailAry = ['liangjinwen@polyv.net', 'shenhuiying@corp.polyv.net'];

router.beforeEach((to, from, next) => {
  // 页面刚打开请求用户信息
  if (!store.state.user.isLogin) {
    const getLoginData = () => {
      store.dispatch('user/getUserInfo');
      // .then((res) => {
      //   const { billingPlan = 'duration' } = res.data;
      //   const czc = '_czc';
      //   window[czc].push(['_setCustomVar', 'user', billingPlan, 1]);

      //   Vue.prototype.$service = new Service(res.data);
      //   Vue.prototype.$isYiZhi = res.data.isKmelearningTeacher === 'Y' || yiZhiEmailAry.indexOf(res.data.email) > -1;
      // })
      // .catch((err) => {
      //   console.error(err);
      //   Vue.prototype.$service = new Service();
      // });
    };

    getLoginData();
  }

  // 设置页面title
  const title = to.meta.title || to.meta.name;
  if (title) {
    if (to.params && to.params.id) {
      document.title = `${to.params.id}-${title}`;
    } else {
      document.title = title;
    }
  }
  next();
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
