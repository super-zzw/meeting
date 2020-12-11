import Vue from 'vue';
import Router from 'vue-router';
import routes from './routes';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes
});

router.afterEach((to) => {
  document.title = to.meta.title || '保利威云会议';
});
export default router;
