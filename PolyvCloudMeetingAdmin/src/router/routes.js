export default [
  {
    path: '/',
    redirect: '/account',
    component: () => import('@/components/layout/layout'),
    children: [
      {
        path: 'account',
        meta: {
          title: '账号管理'
        },
        component: () => import('@/views/account/account')
      },
      {
        path: 'statistics',
        meta: {
          title: '会议记录'
        },
        component: () => import('@/views/statistics/statistics')
      },
      {
        path: 'customization',
        meta: {
          title: '企业定制'
        },
        component: () => import('@/views/customization/customization')
      },
      {
        path: 'accountinfo',
        meta: {
          title: '账号详情'
        },
        component: () => import('@/views/accountinfo/accountinfo'),
        children: [
          {
            path: 'details',
            meta: {
              title: '详情'
            },
            component: () => import('@/views/accountinfo/details'),
          },
          {
            path: 'modify',
            meta: {
              title: '修改密码'
            },
            component: () => import('@/views/accountinfo/modify'),
          }
        ]
      }
    ]
  }
];
