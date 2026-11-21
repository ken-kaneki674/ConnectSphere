import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    posts: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_POSTS(state, posts) {
      state.posts = posts
    },
    ADD_POST(state, post) {
      state.posts.unshift(post)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchPosts({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get('/posts')
        commit('SET_POSTS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createPost({ commit }, postData) {
      try {
        const response = await api.post('/posts', postData)
        commit('ADD_POST', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },
  getters: {
    allPosts: state => state.posts,
    isLoading: state => state.loading,
    error: state => state.error
  }
}
