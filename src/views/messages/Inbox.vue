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
                <div class="input-group">
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    class="form-control" 
                    placeholder="Rechercher une conversation..."
                  >
                  <button class="btn btn-outline-primary">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
              
              <div class="conversations">
                <div 
                  v-for="conversation in filteredConversations" 
                  :key="conversation.id"
                  class="conversation-item"
                  :class="{ active: selectedConversation === conversation.id }"
                  @click="selectConversation(conversation.id)"
                >
                  <img 
                    :src="conversation.user.profile_picture || '/default-avatar.png'" 
                    class="conversation-avatar"
                  >
                  <div class="conversation-content">
                    <div class="conversation-name">{{ conversation.user.username }}</div>
                    <div class="conversation-last-message">{{ conversation.last_message }}</div>
                    <div class="conversation-time">{{ formatTime(conversation.updated_at) }}</div>
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
                  :src="selectedConversation.user.profile_picture || '/default-avatar.png'" 
                  class="chat-avatar"
                >
                <div class="chat-user-details">
                  <h6 class="mb-0">{{ selectedConversation.user.username }}</h6>
                  <small class="text-muted">
                    <i class="bi bi-circle-fill text-success me-1"></i>
                    En ligne
                  </small>
                </div>
              </div>
              <div class="chat-actions">
                <button class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-telephone"></i>
                </button>
                <button class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-camera-video"></i>
                </button>
                <button class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-info-circle"></i>
                </button>
              </div>
            </div>
            
            <div class="chat-messages" ref="messagesContainer">
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
                    @keydown.enter.prevent="sendMessage"
                  >
                  <button class="btn btn-primary" type="submit" :disabled="!newMessage.trim()">
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
export default {
  name: 'MessagesInbox',
  data() {
    return {
      conversations: [
        {
          id: 1,
          user: { username: 'Alice', profile_picture: null },
          last_message: 'Salut ! Comment ça va ?',
          updated_at: new Date(),
          unread: 2
        },
        {
          id: 2,
          user: { username: 'Bob', profile_picture: null },
          last_message: 'À plus tard',
          updated_at: new Date(Date.now() - 3600000),
          unread: 0
        },
        {
          id: 3,
          user: { username: 'Charlie', profile_picture: null },
          last_message: 'Merci pour ton aide',
          updated_at: new Date(Date.now() - 7200000),
          unread: 1
        }
      ],
      selectedConversation: null,
      messages: [],
      newMessage: '',
      searchQuery: ''
    }
  },
  computed: {
    filteredConversations() {
      if (!this.searchQuery) return this.conversations
      
      return this.conversations.filter(conv => 
        conv.user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  methods: {
    selectConversation(conversationId) {
      this.selectedConversation = this.conversations.find(c => c.id === conversationId)
      this.loadMessages(conversationId)
    },
    
    loadMessages(conversationId) {
      // Simulation de chargement des messages
      this.messages = [
        {
          id: 1,
          content: 'Salut ! Comment ça va ?',
          is_sender: false,
          created_at: new Date(Date.now() - 1800000)
        },
        {
          id: 2,
          content: 'Ça va bien, merci ! Et toi ?',
          is_sender: true,
          created_at: new Date(Date.now() - 1700000)
        },
        {
          id: 3,
          content: 'Super ! Je prépare une surprise',
          is_sender: false,
          created_at: new Date(Date.now() - 1600000)
        }
      ]
      
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
        }
      })
    },
    
    sendMessage() {
      if (!this.newMessage.trim()) return
      
      const message = {
        id: Date.now(),
        content: this.newMessage,
        is_sender: true,
        created_at: new Date()
      }
      
      this.messages.push(message)
      this.newMessage = ''
      
      // Marquer comme lu
      const conv = this.conversations.find(c => c.id === this.selectedConversation.id)
      if (conv) {
        conv.unread = 0
      }
      
      this.$root.$emit('show-notification', 'Message envoyé !', 'success')
    },
    
    formatTime(date) {
      return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
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
