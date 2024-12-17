import request from '@/utils/request'
import type { AxiosResponse } from 'axios'

export interface TrackingInfo {
  id: string
  waybillNo: string
  status: string
  location: string
  timestamp: string
  description: string
}

export interface TrackingListResponse {
  items: TrackingInfo[]
  total: number
}

// 获取物流跟踪信息
export function getTrackingInfo(waybillNo: string): Promise<AxiosResponse<TrackingInfo[]>> {
  return request({
    url: `/logistics/tracking/${waybillNo}`,
    method: 'get'
  })
}

// 更新物流状态
export function updateTrackingStatus(waybillNo: string, data: {
  status: string
  location: string
  description: string
}): Promise<AxiosResponse<TrackingInfo>> {
  return request({
    url: `/logistics/tracking/${waybillNo}`,
    method: 'post',
    data
  })
} 