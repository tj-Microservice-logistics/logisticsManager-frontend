import request from '@/utils/request'
import type { Waybill } from '@/types/waybill.ts'

// 获取全部运单
export function getAllWaybills() {
  return request<Waybill[]>({
    url: 'http://100.76.102.33:9082/waybill/allWaybills',
    method: "get"
  })
}

export const waybillAPI = {
  getAllWaybills,
}

