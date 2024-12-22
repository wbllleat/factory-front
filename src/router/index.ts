import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UserManageView.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'equipment',
          name: 'equipment',
          component: () => import('@/views/EquipmentManageView.vue'),
          meta: { title: '设备管理' }
        },
        {
          path: 'maintenance',
          name: 'maintenance',
          component: () => import('@/views/MaintenanceManageView.vue'),
          meta: { title: '维修管理' }
        },
        {
          path: 'rental',
          name: 'rental',
          component: () => import('@/views/RentalManageView.vue'),
          meta: { title: '租赁管理' }
        }
        // ... 其他路由
      ]
    }
  ]
})

export default router 