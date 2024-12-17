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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 