import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    user: null,
    token: localStorage.getItem('token') || null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
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
      localStorage.removeItem('token')
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      })
      const { user, token } = response.data
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      return response.data
    },
    async register(_, userData) {
      const response = await api.post('/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password
      })
      return response.data
    },
    logout({ commit }) {
      commit('LOGOUT')
      commit('messages/RESET', null, { root: true })
    },
    async fetchProfile({ commit }) {
      const response = await api.get('/auth/profile')
      commit('SET_USER', response.data)
      return response.data
    }
  },
  getters: {
    currentUser: state => state.user,
    isAuthenticated: state => !!state.user && !!state.token,
    token: state => state.token
  }
}
