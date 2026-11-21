import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    comments: {},
    loading: false,
    error: null
  },
  mutations: {
    SET_COMMENTS(state, { postId, comments }) {
      state.comments = { ...state.comments, [postId]: comments }
    },
    ADD_COMMENT(state, { postId, comment }) {
      if (!state.comments[postId]) {
        state.comments[postId] = []
      }
      state.comments[postId].push(comment)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchComments({ commit }, postId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(`/posts/${postId}/comments`)
        commit('SET_COMMENTS', { postId, comments: response.data })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createComment({ commit }, { postId, content }) {
      try {
        const response = await api.post(`/posts/${postId}/comments`, { content })
        commit('ADD_COMMENT', { postId, comment: response.data })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },
  getters: {
    getCommentsByPost: state => postId => state.comments[postId] || [],
    isLoading: state => state.loading,
    error: state => state.error
  }
}
