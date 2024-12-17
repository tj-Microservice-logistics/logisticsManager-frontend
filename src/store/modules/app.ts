import type { AppState } from '../types'

const state: AppState = {
  sidebar: {
    isCollapse: false
  }
}

const mutations = {
  TOGGLE_SIDEBAR(state: AppState) {
    state.sidebar.isCollapse = !state.sidebar.isCollapse
  }
}

const actions = {
  toggleSidebar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 