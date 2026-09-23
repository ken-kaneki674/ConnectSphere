import api from '../../services/api'

// L'état « liké » et le compteur vivent sur l'objet post lui-même (post.liked, post.likes_count)
export default {
  namespaced: true,
  actions: {
    async toggleLike({ commit }, postId) {
      const response = await api.post(`/posts/${postId}/like`)
      commit('posts/UPDATE_POST', { id: postId, ...response.data }, { root: true })
      return response.data
    },
    async fetchLikes(_, postId) {
      const response = await api.get(`/posts/${postId}/likes`)
      return response.data
    }
  }
}
