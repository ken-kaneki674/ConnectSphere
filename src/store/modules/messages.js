import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    conversations: [],
    messages: {},
    loading: false,
    error: null
  },
  mutations: {
    SET_CONVERSATIONS(state, conversations) {
      state.conversations = conversations
    },
    SET_MESSAGES(state, { conversationId, messages }) {
      state.messages = { ...state.messages, [conversationId]: messages }
    },
    ADD_MESSAGE(state, { conversationId, message }) {
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = []
      }
      state.messages[conversationId].push(message)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchConversations({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get('/messages/conversations')
        commit('SET_CONVERSATIONS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchMessages({ commit }, conversationId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(`/messages/conversations/${conversationId}`)
        commit('SET_MESSAGES', { conversationId, messages: response.data })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async sendMessage({ commit }, { conversationId, content }) {
      try {
        const response = await api.post(`/messages/conversations/${conversationId}`, { content })
        commit('ADD_MESSAGE', { conversationId, message: response.data })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },
  getters: {
    allConversations: state => state.conversations,
    getMessagesByConversation: state => conversationId => state.messages[conversationId] || [],
    isLoading: state => state.loading,
    error: state => state.error
  }
}
