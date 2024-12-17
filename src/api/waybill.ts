import request from '@/utils/request'
import type { AxiosResponse } from 'axios'

export interface Waybill {
  id: string
  waybillNo: string
  orderNo: string
  status: 'pending' | 'shipping' | 'completed' | 'cancelled'
  createTime: string
  sender: {
    name: string
    phone: string
  }
  receiver: {
    name: string
    phone: string
  }
}

export interface WaybillListParams {
  page: number
  pageSize: number
  status?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface WaybillListResponse {
  items: Waybill[]
  total: number
}

// 获取运单列表
export function fetchWaybillList(params: WaybillListParams): Promise<AxiosResponse<WaybillListResponse>> {
  return request({
    url: '/waybill/list',
    method: 'get',
    params
  })
}

// 获取运单详情
export function getWaybill(id: string): Promise<AxiosResponse<Waybill>> {
  return request({
    url: `/waybill/${id}`,
    method: 'get'
  })
}

// 创建运单
export function createWaybill(data: Omit<Waybill, 'id' | 'waybillNo' | 'createTime'>): Promise<AxiosResponse<Waybill>> {
  return request({
    url: '/waybill',
    method: 'post',
    data
  })
}

// 更新运单
export function updateWaybill(id: string, data: Partial<Waybill>): Promise<AxiosResponse<Waybill>> {
  return request({
    url: `/waybill/${id}`,
    method: 'put',
    data
  })
}

// 删除运单
export function deleteWaybill(id: string): Promise<AxiosResponse<void>> {
  return request({
    url: `/waybill/${id}`,
    method: 'delete'
  })
} 