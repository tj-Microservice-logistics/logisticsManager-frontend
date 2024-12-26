import request from '@/utils/request'

export interface ResponseMessage<T> {
  code: number;
  message: string;
  data: T;
}

export interface WaybillDto {
  waybillId: number;
  routeId: number;
  orderId: number;
  vehiclePlateNumber: string;
  driverName: string;
  transportStatus: string;
  createdAt: string;
  updatedAt: string;
  startWarehouseId: number;
  endWarehouseId: number;
  cargoWeight: number;
}

// 运单列表返回的数据结构
export type WaybillListResponse = ResponseMessage<WaybillDto[]>;

// 获取全部运单
export function getAllWaybills(): Promise<WaybillListResponse> {
  return request({
    url: 'http://100.66.120.228:9082/waybill/allWaybills',
    method: "GET"
  })
}

export const waybillAPI = {
  getAllWaybills,
}
