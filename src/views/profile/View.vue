<template>
  <div class="profile-view">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              <img 
                :src="user?.profile_picture || '/default-avatar.png'" 
                class="rounded-circle mb-3" 
                width="120" 
                height="120"
              >
              <h4>{{ user?.username }}</h4>
              <p class="text-muted">{{ user?.email }}</p>
              
              <div class="d-flex justify-content-around mb-3">
                <div>
                  <h5>{{ posts.length }}</h5>
                  <small class="text-muted">Publications</small>
                </div>
                <div>
                  <h5>{{ friendsCount }}</h5>
                  <small class="text-muted">Amis</small>
                </div>
                <div>
                  <h5>{{ groupsCount }}</h5>
                  <small class="text-muted">Groupes</small>
                </div>
              </div>
              
              <button class="btn btn-primary w-100" v-if="isOwnProfile">
                <i class="bi bi-gear"></i> Modifier le profil
              </button>
              <button class="btn btn-outline-primary w-100" v-else>
                <i class="bi bi-person-plus"></i> Ajouter en ami
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
                  @like="handleLike"
                  @comment="handleComment"
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
import PostCard from '../../components/posts/PostCard.vue'

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
      friendsCount: 0,
      groupsCount: 0
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    isOwnProfile() {
      return this.$route.params.id === this.currentUser?.id?.toString()
    }
  },
  methods: {
    async fetchProfile() {
      this.loading = true
      try {
        // Simulation de données
        this.user = {
          id: this.$route.params.id,
          username: 'Utilisateur',
          email: 'user@example.com',
          profile_picture: null
        }
        this.posts = []
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        this.loading = false
      }
    },
    
    handleLike(postId) {
      console.log('Like post:', postId)
    },
    
    handleComment({ postId, content }) {
      console.log('Comment on post:', postId, content)
    }
  },
  async created() {
    await this.fetchProfile()
  },
  watch: {
    '$route.params.id'() {
      this.fetchProfile()
    }
  }
}
</script>
