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
    UPDATE_POST(state, { id, ...changes }) {
      const post = state.posts.find(p => p.id === id)
      if (post) Object.assign(post, changes)
    },
    REMOVE_POST(state, postId) {
      state.posts = state.posts.filter(p => p.id !== postId)
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
      commit('SET_ERROR', null)
      try {
        const response = await api.get('/posts')
        commit('SET_POSTS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Impossible de charger les publications')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createPost({ commit }, postData) {
      const response = await api.post('/posts', postData)
      commit('ADD_POST', response.data)
      return response.data
    },
    async deletePost({ commit }, postId) {
      await api.delete(`/posts/${postId}`)
      commit('REMOVE_POST', postId)
    }
  },
  getters: {
    allPosts: state => state.posts,
    isLoading: state => state.loading,
    error: state => state.error
  }
}
