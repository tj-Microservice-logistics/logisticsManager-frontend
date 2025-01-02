// src/api/warehouses.ts
import axios from 'axios';
import request from "@/utils/request";

export const getWarehouses = (page: number = 0, size: number = 50) => {
    return axios.get('http://100.76.102.33:9081/warehouses', {
        timeout: 10000, // 设置合理的超时时间
        headers: {
            'Content-Type': 'application/json'
        },
        params: { page, size }
    });
};
export function getWarehouse(warehouseId: number) {
    return request({
        url: `http://100.76.102.33:9082/warehouse/${warehouseId}`,
        method: 'get'
    })
}
