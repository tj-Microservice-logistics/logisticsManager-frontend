import request from '@/utils/request';

// 获取未分配司机列表
export const getUnassignedDrivers = (params: { warehouseId: number }) => {
  return request({
    url: '/schedule/unassigned-drivers',
    method: 'get',
    params,
  });
};

// 获取未分配车辆列表
export const getAvailableVehicles = (params: { warehouseId: number }) => {
  return request({
    url: '/schedule/available-vehicles',
    method: 'get',
    params,
  });
};

// 分配车辆给司机
export const assignVehicleToDriver = (data: { driverId: number; vehicleId: number }) => {
  return request({
    url: '/schedule/assign',
    method: 'post',
    params: data,
  });
};
