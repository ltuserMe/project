import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

const state = {
  token: getToken(),
  userInfo: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
  }
}

const actions = {
  // 登录
  async login({ commit }, userInfo) {
    try {
      const { data } = await login(userInfo)
      commit('SET_TOKEN', data.token)
      setToken(data.token)
      return data
    } catch (error) {
      throw error
    }
  },

  // 获取用户信息
  async getUserInfo({ commit }) {
    try {
      const { data } = await getUserInfo()
      commit('SET_USER_INFO', data)
      return data
    } catch (error) {
      throw error
    }
  },

  // 登出
  async logout({ commit }) {
    try {
      await logout()
      commit('SET_TOKEN', '')
      commit('SET_USER_INFO', {})
      removeToken()
    } catch (error) {
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 