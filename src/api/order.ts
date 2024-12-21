import request from '@/utils/request'
import type { Order, OrderQuery } from '@/types/order'

// 获取订单列表
export function getOrderList(params: OrderQuery) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

// 创建订单
export function createOrder(data: any) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

// 更新支付状态
export function updatePaymentCompleted(orderId: number) {
  return request({
    url: `/order/update-payment-completed`,
    method: 'post',
    params: { orderId }
  })
}

// 统一导出 API 对象
export const orderAPI = {
  getOrderList,
  createOrder,
  updatePaymentCompleted
}