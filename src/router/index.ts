import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
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
            path: 'types',
            name: 'VehicleTypes',
            component: () => import('@/views/vehicles/VehicleTypes.vue'),
            meta: { title: '车型管理' }
          },
          {
            path: 'list',
            name: 'VehicleList',
            component: () => import('@/views/vehicles/VehicleList.vue'),
            meta: { title: '车辆列表' }
          },
          {
            path: 'return',
            name: 'VehicleReturn',
            component: () => import('@/views/vehicles/VehicleReturn.vue'),
            meta: { title: '回车登记' }
          }
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
          {
            path: 'managers',
            name: 'Managers',
            component: () => import('@/views/staff/Managers.vue'),
            meta: { title: '仓库负责人' }
          },
          {
            path: 'schedule',
            name: 'Schedule',
            component: () => import('@/views/staff/Schedule.vue'),
            meta: { title: '排班管理' }
          }
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
        meta: { title: '报表管理' },
        children: [
          {
            path: 'generate',
            name: 'Generate',
            component: () => import('@/views/reports/ReportGenerate.vue'),
            meta: { title: '报表生成' }
          },
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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 