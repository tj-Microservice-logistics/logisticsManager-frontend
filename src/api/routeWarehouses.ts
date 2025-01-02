import request from "@/utils/request";

export function getRouteWarehouses(orderNumber: string) {
    return request({
        url: `http://100.76.102.33:9082/routeWarehouses/${orderNumber}`,
        method: 'get'
    })
}
