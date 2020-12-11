export default [{
  path: '/',
  redirect: '/login',
  component: () => import('@/App.vue'),
  children: [{
    path: 'login',
    component: () => import('@/views/meeting/login'),
  }, {
    path: 'video',
    component: () => import('@/views/meeting/video'),
  }]
}, {
  path: 'login',
  component: () => import('@/views/meeting/login'),
}];
