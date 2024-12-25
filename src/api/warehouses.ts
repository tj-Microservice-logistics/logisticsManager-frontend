// src/api/warehouses.ts
import axios from 'axios';

export const getWarehouses = (page: number = 0, size: number = 50) => {
    return axios.get('http://100.80.117.24:9082/warehouses', {
        timeout: 10000, // 设置合理的超时时间
        headers: {
            'Content-Type': 'application/json'
        },
        params: { page, size }
    });
};
