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
                    ref="postInput"
                    v-model="newPost.content"
                    class="form-control post-textarea"
                    placeholder="Partagez ce que vous pensez..."
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div class="d-flex justify-content-end align-items-center">
                  <button type="submit" class="btn btn-primary" :disabled="!newPost.content.trim() || publishing">
                    <span v-if="publishing" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-send me-2"></i>
                    Publier
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4" v-else>
        <div class="col-lg-8 mx-auto">
          <div class="alert alert-info">
            <router-link to="/login">Connectez-vous</router-link> pour publier, aimer et commenter.
          </div>
        </div>
      </div>

      <!-- Fil d'actualité -->
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <LoadingSpinner v-if="isLoading" message="Chargement des publications..." />

          <div v-else-if="error" class="alert alert-danger fade-in-up">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
            <button class="btn btn-sm btn-outline-danger ms-2" @click="loadPosts">Réessayer</button>
          </div>

          <div v-else-if="allPosts.length === 0" class="empty-state text-center py-5">
            <i class="bi bi-inbox display-4 text-muted mb-3"></i>
            <h4 class="text-muted">Aucune publication pour le moment</h4>
            <p class="text-muted">
              Soyez le premier à partager quelque chose !
            </p>
            <button
              v-if="isAuthenticated"
              @click="startFirstPost"
              class="btn btn-primary mt-3"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Créer une publication
            </button>
          </div>

          <div v-else class="posts-feed">
            <PostCard
              v-for="post in allPosts"
              :key="post.id"
              :post="post"
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
import { notify, errorMessage } from '../../services/notify'

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
      },
      publishing: false
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...mapGetters('posts', ['allPosts', 'isLoading', 'error'])
  },
  methods: {
    ...mapActions('posts', ['fetchPosts', 'createPost']),

    loadPosts() {
      // L'erreur est déjà exposée par le getter posts/error
      this.fetchPosts().catch(() => {})
    },

    startFirstPost() {
      this.newPost.content = 'Première publication sur ConnectSphere !'
      this.$nextTick(() => this.$refs.postInput?.focus())
    },

    async handleCreatePost() {
      const content = this.newPost.content.trim()
      if (!content) return

      this.publishing = true
      try {
        await this.createPost({ content })
        this.newPost.content = ''
        notify('Publication créée avec succès !', 'success')
      } catch (error) {
        notify(errorMessage(error, 'Erreur lors de la publication'), 'error')
      } finally {
        this.publishing = false
      }
    }
  },
  created() {
    this.loadPosts()
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
