import Vue from 'vue';
import Router from 'vue-router';
import routes from './routes';

Vue.use(Router);

const router = new Router({
  linkActiveClass: 'live-link-active',
  mode: 'history',
  routes
});

router.afterEach((to) => {
  document.title = to.meta.title || '';
});
export default router;
