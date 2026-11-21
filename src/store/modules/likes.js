import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    likes: {},
    loading: false,
    error: null
  },
  mutations: {
    SET_LIKES(state, { postId, likes }) {
      state.likes = { ...state.likes, [postId]: likes }
    },
    ADD_LIKE(state, { postId, like }) {
      if (!state.likes[postId]) {
        state.likes[postId] = []
      }
      state.likes[postId].push(like)
    },
    REMOVE_LIKE(state, { postId, likeId }) {
      if (state.likes[postId]) {
        state.likes[postId] = state.likes[postId].filter(like => like.id !== likeId)
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async toggleLike({ commit }, postId) {
      try {
        const response = await api.post(`/posts/${postId}/like`)
        if (response.data.liked) {
          commit('ADD_LIKE', { postId, like: response.data.like })
        } else {
          commit('REMOVE_LIKE', { postId, likeId: response.data.likeId })
        }
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    async fetchLikes({ commit }, postId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(`/posts/${postId}/likes`)
        commit('SET_LIKES', { postId, likes: response.data })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    getLikesByPost: state => postId => state.likes[postId] || [],
    getLikesCount: state => postId => (state.likes[postId] || []).length,
    isLoading: state => state.loading,
    error: state => state.error
  }
}
