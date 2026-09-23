<template>
  <div class="group-detail">
    <div class="container">
      <router-link to="/groups" class="btn btn-link px-0 mb-3">
        <i class="bi bi-arrow-left"></i> Tous les groupes
      </router-link>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else-if="group" class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-body">
              <h2 class="card-title">
                <i class="bi bi-people-fill text-primary me-2"></i>{{ group.name }}
                <span v-if="group.privacy === 'private'" class="badge bg-secondary fs-6 align-middle">Privé</span>
              </h2>
              <p class="text-muted">{{ group.members_count }} membre{{ group.members_count > 1 ? 's' : '' }}</p>
              <p class="card-text">{{ group.description || 'Pas de description.' }}</p>

              <div class="d-flex gap-2">
                <button
                  v-if="!group.is_member && group.privacy === 'public'"
                  class="btn btn-primary"
                  @click="handleJoin"
                >
                  <i class="bi bi-plus"></i> Rejoindre
                </button>
                <button
                  v-if="group.is_member && !group.is_admin"
                  class="btn btn-outline-danger"
                  @click="handleLeave"
                >
                  Quitter le groupe
                </button>
                <button
                  v-if="group.is_admin"
                  class="btn btn-danger"
                  @click="handleDelete"
                >
                  <i class="bi bi-trash"></i> Supprimer le groupe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header"><h5 class="mb-0">Membres</h5></div>
            <ul class="list-group list-group-flush">
              <li v-for="member in group.members" :key="member.id" class="list-group-item d-flex align-items-center">
                <img :src="avatarUrl(member.profile_picture)" class="rounded-circle me-2" width="32" height="32">
                <router-link :to="`/profile/${member.id}`" class="flex-grow-1 text-decoration-none">
                  {{ member.username }}
                </router-link>
                <span v-if="member.role === 'admin'" class="badge bg-primary">Admin</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../services/api'
import { notify, errorMessage } from '../../services/notify'
import { avatarUrl } from '../../utils/format'

export default {
  name: 'GroupDetail',
  data() {
    return {
      group: null,
      loading: false,
      error: null
    }
  },
  methods: {
    avatarUrl,

    async loadGroup() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/groups/${this.$route.params.id}`)
        this.group = response.data
      } catch (error) {
        const status = error.response?.status
        this.error = status === 404 ? 'Groupe introuvable'
          : status === 403 ? 'Ce groupe est privé'
            : 'Impossible de charger le groupe'
      } finally {
        this.loading = false
      }
    },

    async handleJoin() {
      try {
        await this.$store.dispatch('groups/joinGroup', this.group.id)
        await this.loadGroup()
        notify('Vous avez rejoint le groupe', 'success')
      } catch (error) {
        notify(errorMessage(error, 'Impossible de rejoindre le groupe'), 'error')
      }
    },

    async handleLeave() {
      if (!confirm('Quitter ce groupe ?')) return
      try {
        await this.$store.dispatch('groups/leaveGroup', this.group.id)
        await this.loadGroup()
        notify('Vous avez quitté le groupe', 'success')
      } catch (error) {
        notify(errorMessage(error, 'Impossible de quitter le groupe'), 'error')
      }
    },

    async handleDelete() {
      if (!confirm('Supprimer définitivement ce groupe ?')) return
      try {
        await this.$store.dispatch('groups/deleteGroup', this.group.id)
        notify('Groupe supprimé', 'success')
        this.$router.push('/groups')
      } catch (error) {
        notify(errorMessage(error, 'Suppression impossible'), 'error')
      }
    }
  },
  created() {
    this.loadGroup()
  },
  watch: {
    '$route.params.id'(id) {
      if (id) this.loadGroup()
    }
  }
}
</script>
