import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    LOGOUT(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await api.post('/auth/login', credentials)
        const { user, token } = response.data
        commit('SET_USER', user)
        commit('SET_TOKEN', token)
        return response.data
      } catch (error) {
        throw error
      }
    },
    async register({ commit }, userData) {
      try {
        const response = await api.post('/auth/register', userData)
        return response.data
      } catch (error) {
        throw error
      }
    },
    async logout({ commit }) {
      commit('LOGOUT')
    },
    async fetchProfile({ commit }) {
      try {
        const response = await api.get('/auth/profile')
        commit('SET_USER', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    }
  },
  getters: {
    currentUser: state => state.user,
    isAuthenticated: state => state.isAuthenticated,
    token: state => state.token
  }
}
