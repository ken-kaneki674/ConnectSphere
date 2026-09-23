import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    comments: {},
    loadingPosts: {}
  },
  mutations: {
    SET_COMMENTS(state, { postId, comments }) {
      state.comments[postId] = comments
    },
    ADD_COMMENT(state, { postId, comment }) {
      if (!state.comments[postId]) {
        state.comments[postId] = []
      }
      state.comments[postId].push(comment)
    },
    SET_LOADING(state, { postId, loading }) {
      state.loadingPosts[postId] = loading
    }
  },
  actions: {
    async fetchComments({ commit }, postId) {
      commit('SET_LOADING', { postId, loading: true })
      try {
        const response = await api.get(`/posts/${postId}/comments`)
        commit('SET_COMMENTS', { postId, comments: response.data })
        return response.data
      } finally {
        commit('SET_LOADING', { postId, loading: false })
      }
    },
    async createComment({ commit }, { postId, content }) {
      const response = await api.post(`/posts/${postId}/comments`, { content })
      commit('ADD_COMMENT', { postId, comment: response.data })
      return response.data
    }
  },
  getters: {
    getCommentsByPost: state => postId => state.comments[postId] || [],
    hasLoaded: state => postId => postId in state.comments,
    isLoading: state => postId => !!state.loadingPosts[postId]
  }
}
