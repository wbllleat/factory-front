import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
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
      },
      {
        path: 'inspection',
        name: 'inspection',
        component: () => import('@/views/InspectionManageView.vue'),
        meta: { title: '巡检管理' }
      }
      // ... 其他路由
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login' })
  } else if (to.name === 'login' && token) {
    // 已登录但访问登录页，重定向到首页
    next({ path: '/' })
  } else {
    next()
  }
})

export default router 