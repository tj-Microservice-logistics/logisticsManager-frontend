import request from '@/utils/request'
import type { AxiosResponse } from 'axios'
import axios from 'axios'

// 司机接口数据类型
export interface Driver {
  driverId: number;
  fullName: string;
  contactNumber: string;
  isAvailable: boolean;
  warehouseId: number; // 仓库 ID
  warehouseName: string; // 仓库名称
}


// 获取司机列表
export function getDrivers(params: { page: number; size: number }) {
  return request({
    url: '/drivers',
    method: 'get',
    params,
  });
}

// 添加新司机
export function addDriver(data: {
  fullName: string
  contactNumber: string
  assignedVehicle?: number | null
  warehouseId?: number | null
  isAvailable: boolean
}): Promise<AxiosResponse<Driver>> {
  return request({
    url: '/drivers',
    method: 'post',
    data
  })
}

// 更新司机信息
export function updateDriver(driverId: number, data: {
  fullName: string
  contactNumber: string
  warehouseId?: number | null
  isAvailable: boolean
}): Promise<AxiosResponse<Driver>> {
  console.log('更新司机请求 URL 和数据：', `drivers/${driverId}`, data)

  axios.put(`http://localhost:9081/drivers/${driverId}`, data);

}

// 删除司机
export function deleteDriver(driverId: number): Promise<AxiosResponse<void>> {
  return request({
    url: `/drivers/${driverId}`,
    method: 'delete'
  })
}
