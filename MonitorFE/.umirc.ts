export default {
  npmClient: 'yarn',
  routes: [
    {
      path: '/',
      // component: 'main'
      redirect: '/main'
    },
    {
      path: '/login',
      component: 'login'
    },
    {
      path: '/main',
      component: 'main'
    },
    {
      path: '/register',
      component: 'register'
    }
    ]
};
