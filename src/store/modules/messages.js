import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    conversations: [],
    messages: {}
  },
  mutations: {
    SET_CONVERSATIONS(state, conversations) {
      state.conversations = conversations
    },
    SET_MESSAGES(state, { conversationId, messages }) {
      state.messages[conversationId] = messages
    },
    ADD_MESSAGE(state, { conversationId, message }) {
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = []
      }
      state.messages[conversationId].push(message)
      const conversation = state.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.last_message = message.content
        conversation.updated_at = message.created_at
      }
    },
    MARK_READ(state, conversationId) {
      const conversation = state.conversations.find(c => c.id === conversationId)
      if (conversation) conversation.unread = 0
    },
    RESET(state) {
      state.conversations = []
      state.messages = {}
    }
  },
  actions: {
    async fetchConversations({ commit }) {
      const response = await api.get('/messages/conversations')
      commit('SET_CONVERSATIONS', response.data)
      return response.data
    },
    async fetchMessages({ commit }, conversationId) {
      const response = await api.get(`/messages/conversations/${conversationId}`)
      commit('SET_MESSAGES', { conversationId, messages: response.data })
      commit('MARK_READ', conversationId)
      return response.data
    },
    async sendMessage({ commit }, { conversationId, content }) {
      const response = await api.post(`/messages/conversations/${conversationId}`, { content })
      commit('ADD_MESSAGE', { conversationId, message: response.data })
      return response.data
    },
    async startConversation({ dispatch }, { username, recipientId }) {
      const response = await api.post('/messages/conversations', { username, recipientId })
      await dispatch('fetchConversations')
      return response.data.conversationId
    }
  },
  getters: {
    allConversations: state => state.conversations,
    getMessagesByConversation: state => conversationId => state.messages[conversationId] || [],
    unreadCount: state => state.conversations.reduce((sum, c) => sum + (c.unread || 0), 0)
  }
}
