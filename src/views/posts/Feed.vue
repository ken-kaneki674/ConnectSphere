<template>
  <div class="feed">
    <div class="container">
      <!-- Formulaire de publication -->
      <div class="row mb-4" v-if="isAuthenticated">
        <div class="col-lg-8 mx-auto">
          <div class="create-post-card card fade-in-up">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-pencil-square me-2"></i>
                Créer une publication
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleCreatePost">
                <div class="mb-3">
                  <textarea 
                    v-model="newPost.content" 
                    class="form-control post-textarea" 
                    placeholder="Partagez ce que vous pensez..." 
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="post-options">
                    <button type="button" class="btn btn-outline-primary btn-sm me-2">
                      <i class="bi bi-image me-1"></i> Photo
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm me-2">
                      <i class="bi bi-emoji-smile me-1"></i> Emoji
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm">
                      <i class="bi bi-geo-alt me-1"></i> Localisation
                    </button>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="!newPost.content.trim()">
                    <i class="bi bi-send me-2"></i>
                    Publier
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Fil d'actualité -->
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <LoadingSpinner v-if="loading" message="Chargement des publications..." />
          
          <div v-else-if="error" class="alert alert-danger fade-in-up">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
          
          <div v-else-if="safePosts.length === 0" class="empty-state text-center py-5">
            <i class="bi bi-inbox display-4 text-muted mb-3"></i>
            <h4 class="text-muted">Aucune publication pour le moment</h4>
            <p class="text-muted">
              Soyez le premier à partager quelque chose !
            </p>
            <button 
              v-if="isAuthenticated" 
              @click="newPost.content = 'Première publication sur ConnectSphere !'" 
              class="btn btn-primary mt-3"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Créer une publication
            </button>
          </div>
          
          <div v-else class="posts-feed">
            <PostCard 
              v-for="post in safePosts" 
              :key="post.id" 
              :post="post"
              @like="handleLike"
              @comment="handleComment"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PostCard from '../../components/posts/PostCard.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

export default {
  name: 'Feed',
  components: {
    PostCard,
    LoadingSpinner
  },
  data() {
    return {
      newPost: {
        content: ''
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...mapGetters('posts', ['posts', 'loading', 'error']),
    
    // Assurer que posts est toujours un tableau
    safePosts() {
      return this.posts || []
    }
  },
  methods: {
    ...mapActions('posts', ['fetchPosts', 'createPost']),
    ...mapActions('likes', ['toggleLike']),
    ...mapActions('comments', ['createComment']),
    
    async handleCreatePost() {
      if (!this.newPost.content.trim()) return
      
      try {
        await this.createPost(this.newPost)
        this.newPost.content = ''
        this.$root.$emit('show-notification', 'Publication créée avec succès !', 'success')
      } catch (error) {
        console.error('Erreur lors de la publication:', error)
        this.$root.$emit('show-notification', 'Erreur lors de la publication', 'error')
      }
    },
    
    async handleLike(postId) {
      try {
        await this.toggleLike(postId)
      } catch (error) {
        console.error('Erreur lors du like:', error)
      }
    },
    
    async handleComment({ postId, content }) {
      try {
        await this.createComment({ postId, content })
      } catch (error) {
        console.error('Erreur lors du commentaire:', error)
      }
    }
  },
  async created() {
    await this.fetchPosts()
  }
}
</script>

<style scoped>
.feed {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.create-post-card {
  border: none;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
}

.create-post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.post-textarea {
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 1rem;
  font-size: 1rem;
  resize: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.post-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  background: white;
}

.post-options {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  padding: 4rem 2rem;
}

.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .post-options {
    flex-wrap: wrap;
  }
  
  .post-textarea {
    font-size: 0.9rem;
  }
}
</style>
