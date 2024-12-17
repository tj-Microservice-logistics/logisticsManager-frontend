import request from '@/utils/request'
import type { Order } from '@/types/order'

// 获取订单列表
export function getOrderList(params: {
  page: number
  pageSize: number
  status?: string
  keyword?: string
  startDate?: string
  endDate?: string
}) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id: string) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  })
}

// 创建订单
export function createOrder(data: {
  customerName: string
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  address: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  remark?: string
}) {
  return request({
    url: '/order',
    method: 'post',
    data
  })
} 