<template>
  <div class="search-view">
    <div class="container">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <h2 class="mb-4"><i class="bi bi-search"></i> Résultats pour « {{ query }} »</h2>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

          <p v-else-if="results.length === 0" class="text-muted">Aucun utilisateur trouvé.</p>

          <ul v-else class="list-group">
            <li v-for="user in results" :key="user.id" class="list-group-item d-flex align-items-center">
              <img :src="avatarUrl(user.profile_picture)" class="rounded-circle me-3" width="40" height="40">
              <router-link :to="`/profile/${user.id}`" class="flex-grow-1 text-decoration-none fw-semibold">
                {{ user.username }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import { avatarUrl } from '../utils/format'

export default {
  name: 'Search',
  data() {
    return {
      results: [],
      loading: false,
      error: null
    }
  },
  computed: {
    query() {
      return (this.$route.query.q || '').toString()
    }
  },
  methods: {
    avatarUrl,

    async search() {
      if (!this.query.trim()) {
        this.results = []
        return
      }
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/users/search', { params: { q: this.query } })
        this.results = response.data
      } catch (error) {
        this.error = 'La recherche a échoué'
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    query: {
      immediate: true,
      handler() {
        this.search()
      }
    }
  }
}
</script>
