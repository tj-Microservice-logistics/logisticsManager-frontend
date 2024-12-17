import { RouteRecordRaw } from 'vue-router'
import { PermissionState } from '../types'
import router from '@/router'

const state: PermissionState = {
  routes: []
}

const mutations = {
  SET_ROUTES(state: PermissionState, routes: RouteRecordRaw[]) {
    state.routes = routes
  }
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise((resolve) => {
      // 获取根路由的子路由
      const mainRoute = router.options.routes.find(route => route.path === '/')
      if (mainRoute && mainRoute.children) {
        commit('SET_ROUTES', mainRoute.children)
        resolve(mainRoute.children)
      } else {
        commit('SET_ROUTES', [])
        resolve([])
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 