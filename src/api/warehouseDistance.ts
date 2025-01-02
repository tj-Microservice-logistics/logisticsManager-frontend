import request from "@/utils/request";

export function getAdjacentWarehouse(warehouseId: number) {
    return request({
        url: `http://100.76.102.33:9082/warehouseDistance/${warehouseId}`,
        method: 'get'
    })
}
