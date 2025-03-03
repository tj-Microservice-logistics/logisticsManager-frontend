import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', hidden: true } // hidden 表示不显示在导航菜单
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'Odometer' }
      },
      {
        path: 'vehicles',
        name: 'Vehicles',
        redirect: '/vehicles/list',
        component: () => import('@/views/vehicles/VehicleLayout.vue'),
        meta: { title: '车辆管理', icon: 'Van' },
        children: [
          {
            path: 'list',
            name: 'VehicleList',
            component: () => import('@/views/vehicles/VehicleList.vue'),
            meta: { title: '车辆列表' }
          },
        ]
      },
      {
        path: 'staff',
        name: 'Staff',
        redirect: '/staff/drivers',
        component: () => import('@/views/staff/StaffLayout.vue'),
        meta: { title: '员工管理', icon: 'User' },
        children: [
          {
            path: 'drivers',
            name: 'Drivers',
            component: () => import('@/views/staff/Drivers.vue'),
            meta: { title: '司机管理' }
          },
        ]
      },
      {
        path: 'business',
        name: 'Business',
        redirect: '/business/orders',
        component: () => import('@/views/business/BusinessLayout.vue'),
        meta: { title: '业务管理', icon: 'Shop' },
        children: [
          {
            path: 'orders',
            name: 'Orders',
            component: () => import('@/views/business/orders/OrderList.vue'),
            meta: { title: '订单管理' }
          },
          {
            path: 'waybills',
            name: 'Waybills',
            component: () => import('@/views/business/waybills/WaybillList.vue'),
            meta: { title: '运单管理' }
          }
        ]
      },
      {
        path: 'reports',
        name: 'Reports',
        meta: { title: '报表管理', icon: 'TrendCharts' },
        children: [
          {
            path: 'analysis',
            name: 'Analysis',
            component: () => import('@/views/reports/DataAnalysis.vue'),
            meta: { title: '数据分析' }
          },
          {
            path: 'history',
            name: 'History',
            component: () => import('@/views/reports/ReportHistory.vue'),
            meta: { title: '历史报表' }
          }
        ]
      },
      {
        path: 'test',
        name: 'Test',
        meta: { title: '测试' },
        children: [
          {
            path: 'connection',
            name: 'Connection',
            component: () => import('@/views/testConnection.vue'),
            meta: { title: 'report测试连接' }
          }
        ]
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((_, __, next) => {
  // 全局路由守卫，不使用 to 和 from
  next();
});

export default router;

