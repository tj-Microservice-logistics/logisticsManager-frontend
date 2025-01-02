import request from '@/utils/request';
import type { AxiosResponse } from 'axios';

// 车辆类型定义
export type VehicleType = 'truck' | 'van' | 'forklift' | 'drone';

// 车辆状态定义
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service';

// 车辆接口数据类型
export interface Vehicle {
  vehicleId: number;
  vehicleType: VehicleType;
  licensePlate: string;
  status: boolean;
  assignedTo: number | null; // 分配的司机 ID
  warehouseId: number | null; // 所属仓库 ID
}

// 获取车辆列表（分页）
/**
 * 获取车辆列表
 * @param params - 包含分页信息的参数对象
 * @returns Promise<AxiosResponse<{ items: Vehicle[]; total: number }>>
 */
export function getVehicles(params: { page: number; size: number }) {
  return request({
    url: 'http://100.76.102.33:9081/vehicles',
    method: 'get',
    params,
  });
}


// 添加新车辆
/**
 * 添加新车辆
 * @param data - 车辆信息（不包含 vehicleId）
 * @returns Promise<AxiosResponse<Vehicle>>
 */
export const addVehicle = (data: Omit<Vehicle, 'vehicleId'>): Promise<AxiosResponse<Vehicle>> => {
  return request({
    url: 'http://100.76.102.33:9081/vehicles',
    method: 'post',
    data,
  });
};

// 更新车辆信息
/**
 * 更新车辆信息
 * @param vehicleId - 车辆 ID
 * @param data - 更新的车辆信息
 * @returns Promise<AxiosResponse<Vehicle>>
 */
export function updateVehicle(
  vehicleId: number,
  data: Partial<Omit<Vehicle, 'vehicleId'>>
): Promise<AxiosResponse<Vehicle>> {
  console.log('更新车辆请求 URL 和数据：', `/vehicles/${vehicleId}`, data); // 调试输出
  return request({
    url: `http://100.76.102.33:9081/vehicles/${vehicleId}`,
    method: 'put',
    data,
  });
}


// 删除车辆
/**
 * 删除车辆
 * @param id - 车辆 ID
 * @returns Promise<AxiosResponse<void>>
 */
export const deleteVehicle = (id: number): Promise<AxiosResponse<void>> => {
  return request({
    url: `http://100.76.102.33:9081/vehicles/${id}`,
    method: 'delete',
  });
};

export function getAvailableVehicleAndDriver(params : {startWarehouseId: number; endWarehouseId: number; vehicleId: number}) {
  return request({
    url: `http://100.76.102.33:9081/vehicles/available`,
    method: 'get',
    params
  })
}

export function arriveVehicle(params : { vehicleId: number; driverName: string}) {
  return request({
    url: `http://100.76.102.33:9081/vehicles/arrive`,
    method: 'put',
    params
  })
}
