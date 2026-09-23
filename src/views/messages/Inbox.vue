<template>
  <div class="messages-inbox">
    <div class="container">
      <div class="row">
        <div class="col-lg-4">
          <div class="conversations-list card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-envelope me-2"></i>
                Messages
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="search-box p-3">
                <form class="input-group mb-2" @submit.prevent="handleStartConversation">
                  <input
                    v-model="newContact"
                    type="text"
                    class="form-control"
                    placeholder="Nouveau : nom d'utilisateur"
                  >
                  <button class="btn btn-primary" type="submit" :disabled="!newContact.trim()">
                    <i class="bi bi-plus-lg"></i>
                  </button>
                </form>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Rechercher une conversation..."
                >
              </div>

              <div class="conversations">
                <p v-if="filteredConversations.length === 0" class="text-muted text-center small p-3 mb-0">
                  Aucune conversation. Démarrez-en une avec un nom d'utilisateur.
                </p>
                <div
                  v-for="conversation in filteredConversations"
                  :key="conversation.id"
                  class="conversation-item"
                  :class="{ active: selectedId === conversation.id }"
                  @click="selectConversation(conversation.id)"
                >
                  <img
                    :src="avatarUrl(conversation.user.profile_picture)"
                    class="conversation-avatar"
                  >
                  <div class="conversation-content">
                    <div class="conversation-name">{{ conversation.user.username }}</div>
                    <div class="conversation-last-message">{{ conversation.last_message }}</div>
                    <div class="conversation-time">{{ formatDate(conversation.updated_at) }}</div>
                  </div>
                  <div class="conversation-meta">
                    <span v-if="conversation.unread" class="unread-badge">{{ conversation.unread }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="chat-window card" v-if="selectedConversation">
            <div class="chat-header">
              <div class="chat-user-info">
                <img
                  :src="avatarUrl(selectedConversation.user.profile_picture)"
                  class="chat-avatar"
                >
                <div class="chat-user-details">
                  <router-link :to="`/profile/${selectedConversation.user.id}`" class="text-decoration-none text-reset">
                    <h6 class="mb-0">{{ selectedConversation.user.username }}</h6>
                  </router-link>
                </div>
              </div>
            </div>

            <div class="chat-messages" ref="messagesContainer">
              <p v-if="messages.length === 0" class="text-muted text-center">Aucun message. Dites bonjour 👋</p>
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-bubble"
                :class="{ sent: message.is_sender, received: !message.is_sender }"
              >
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.created_at) }}</div>
              </div>
            </div>

            <div class="chat-input">
              <form @submit.prevent="sendMessage">
                <div class="input-group">
                  <input
                    v-model="newMessage"
                    type="text"
                    class="form-control"
                    placeholder="Écrire un message..."
                  >
                  <button class="btn btn-primary" type="submit" :disabled="!newMessage.trim() || sending">
                    <i class="bi bi-send"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div v-else class="empty-state card">
            <div class="card-body text-center py-5">
              <i class="bi bi-chat-dots display-4 text-muted mb-3"></i>
              <h4 class="text-muted">Sélectionnez une conversation</h4>
              <p class="text-muted">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { notify, errorMessage } from '../../services/notify'
import { avatarUrl, formatDate, formatTime } from '../../utils/format'

const POLL_INTERVAL = 5000

export default {
  name: 'MessagesInbox',
  data() {
    return {
      selectedId: null,
      newMessage: '',
      newContact: '',
      searchQuery: '',
      sending: false
    }
  },
  computed: {
    ...mapGetters('messages', ['allConversations', 'getMessagesByConversation']),
    filteredConversations() {
      const query = this.searchQuery.trim().toLowerCase()
      if (!query) return this.allConversations
      return this.allConversations.filter(conv =>
        conv.user.username.toLowerCase().includes(query)
      )
    },
    selectedConversation() {
      return this.allConversations.find(c => c.id === this.selectedId) || null
    },
    messages() {
      return this.selectedId ? this.getMessagesByConversation(this.selectedId) : []
    }
  },
  methods: {
    ...mapActions('messages', ['fetchConversations', 'fetchMessages', 'startConversation']),
    avatarUrl,
    formatDate,
    formatTime,

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) container.scrollTop = container.scrollHeight
      })
    },

    async selectConversation(conversationId) {
      this.selectedId = conversationId
      if (this.$route.query.c !== String(conversationId)) {
        this.$router.replace({ query: { c: conversationId } })
      }
      try {
        await this.fetchMessages(conversationId)
        this.scrollToBottom()
      } catch (error) {
        notify('Impossible de charger les messages', 'error')
      }
    },

    async refresh() {
      try {
        await this.fetchConversations()
        if (this.selectedId) {
          const before = this.messages.length
          await this.fetchMessages(this.selectedId)
          if (this.messages.length !== before) this.scrollToBottom()
        }
      } catch (error) {
        // Nouvel essai au prochain intervalle
      }
    },

    async sendMessage() {
      const content = this.newMessage.trim()
      if (!content || !this.selectedId) return

      this.sending = true
      try {
        await this.$store.dispatch('messages/sendMessage', { conversationId: this.selectedId, content })
        this.newMessage = ''
        this.scrollToBottom()
      } catch (error) {
        notify(errorMessage(error, 'Message non envoyé'), 'error')
      } finally {
        this.sending = false
      }
    },

    async handleStartConversation() {
      const username = this.newContact.trim()
      if (!username) return

      try {
        const conversationId = await this.startConversation({ username })
        this.newContact = ''
        this.selectConversation(conversationId)
      } catch (error) {
        const message = errorMessage(error, 'Impossible de démarrer la conversation')
        notify(message === 'User not found' ? 'Utilisateur introuvable' : message, 'error')
      }
    }
  },
  async created() {
    try {
      await this.fetchConversations()
    } catch (error) {
      notify('Impossible de charger les conversations', 'error')
    }
    const requested = Number(this.$route.query.c)
    if (requested) this.selectConversation(requested)
    this.pollTimer = setInterval(this.refresh, POLL_INTERVAL)
  },
  beforeUnmount() {
    clearInterval(this.pollTimer)
  }
}
</script>

<style scoped>
.messages-inbox {
  min-height: 100vh;
  background: #f8f9fa;
}

.conversations-list {
  height: calc(100vh - 100px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  border-bottom: 1px solid #e9ecef;
}

.input-group {
  border-radius: 20px;
  overflow: hidden;
}

.input-group input {
  border: none;
  border-radius: 20px 0 0 20px;
}

.input-group button {
  border: none;
  border-radius: 0 20px 20px 0;
}

.conversations {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f8f9fa;
}

.conversation-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.conversation-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.conversation-item.active .conversation-name,
.conversation-item.active .conversation-last-message,
.conversation-item.active .conversation-time {
  color: white;
}

.conversation-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
  border: 2px solid #e9ecef;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.conversation-last-message {
  font-size: 0.9rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.conversation-time {
  font-size: 0.8rem;
  color: #6c757d;
}

.conversation-meta {
  display: flex;
  align-items: center;
}

.unread-badge {
  background: #dc3545;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.chat-window {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
  border: 2px solid #667eea;
}

.chat-user-details h6 {
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f8f9fa;
}

.message-bubble {
  margin-bottom: 1rem;
  display: flex;
  animation: fadeInUp 0.3s ease-out;
}

.message-bubble.sent {
  justify-content: flex-end;
}

.message-bubble.sent .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.message-bubble.received .message-content {
  background: white;
  color: #2c3e50;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid #e9ecef;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.chat-input {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

.chat-input .input-group {
  border-radius: 25px;
  overflow: hidden;
}

.chat-input input {
  border: none;
  border-radius: 25px 0 0 25px;
  padding: 12px 16px;
}

.chat-input button {
  border: none;
  border-radius: 0 25px 25px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.empty-state {
  height: calc(100vh - 100px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .messages-inbox .row {
    flex-direction: column;
  }
  
  .conversations-list {
    height: 300px;
  }
  
  .chat-window {
    height: calc(100vh - 400px);
  }
}
</style>
