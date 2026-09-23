<template>
  <div class="profile-view">
    <div class="container">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="row" v-else>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              <img
                :src="avatarUrl(user?.profile_picture)"
                class="rounded-circle mb-3"
                width="120"
                height="120"
              >
              <h4>{{ user?.username }}</h4>
              <p class="text-muted" v-if="user?.bio">{{ user.bio }}</p>

              <div class="d-flex justify-content-around mb-3">
                <div>
                  <h5>{{ posts.length }}</h5>
                  <small class="text-muted">Publications</small>
                </div>
                <div>
                  <h5>{{ user?.friends_count || 0 }}</h5>
                  <small class="text-muted">Amis</small>
                </div>
                <div>
                  <h5>{{ user?.groups_count || 0 }}</h5>
                  <small class="text-muted">Groupes</small>
                </div>
              </div>

              <button class="btn btn-outline-primary w-100" v-if="user && !isOwnProfile" @click="sendMessage">
                <i class="bi bi-envelope"></i> Envoyer un message
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5>Publications de {{ user?.username }}</h5>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border"></div>
              </div>

              <div v-else-if="posts.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-inbox display-4"></i>
                <p>Aucune publication pour le moment</p>
              </div>

              <div v-else>
                <PostCard
                  v-for="post in posts"
                  :key="post.id"
                  :post="post"
                  @updated="handleUpdated"
                  @deleted="handleDeleted"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '../../services/api'
import PostCard from '../../components/posts/PostCard.vue'
import { notify, errorMessage } from '../../services/notify'
import { avatarUrl } from '../../utils/format'

export default {
  name: 'ProfileView',
  components: {
    PostCard
  },
  data() {
    return {
      user: null,
      posts: [],
      loading: false,
      error: null
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    isOwnProfile() {
      return String(this.$route.params.id) === String(this.currentUser?.id)
    }
  },
  methods: {
    avatarUrl,

    async fetchProfile() {
      const id = this.$route.params.id
      this.loading = true
      this.error = null
      try {
        const [userResponse, postsResponse] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/posts`)
        ])
        this.user = userResponse.data
        this.posts = postsResponse.data
      } catch (error) {
        this.user = null
        this.posts = []
        this.error = error.response?.status === 404 ? 'Utilisateur introuvable' : 'Impossible de charger le profil'
      } finally {
        this.loading = false
      }
    },

    // Les posts du profil ne sont pas dans le store : on applique les changements localement
    handleUpdated({ id, ...changes }) {
      const post = this.posts.find(p => p.id === id)
      if (post) Object.assign(post, changes)
    },

    handleDeleted(postId) {
      this.posts = this.posts.filter(p => p.id !== postId)
    },

    async sendMessage() {
      try {
        const conversationId = await this.$store.dispatch('messages/startConversation', { recipientId: this.user.id })
        this.$router.push({ name: 'Messages', query: { c: conversationId } })
      } catch (error) {
        notify(errorMessage(error, 'Impossible de démarrer la conversation'), 'error')
      }
    }
  },
  created() {
    this.fetchProfile()
  },
  watch: {
    '$route.params.id'(id) {
      if (id) this.fetchProfile()
    }
  }
}
</script>
