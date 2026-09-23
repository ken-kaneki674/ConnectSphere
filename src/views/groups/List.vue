<template>
  <div class="groups-list">
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-8">
          <h2><i class="bi bi-people"></i> Groupes</h2>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle"></i> Créer un groupe
          </button>
        </div>
      </div>

      <div v-if="isLoading && allGroups.length === 0" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else-if="loadError" class="alert alert-danger">
        {{ loadError }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="loadGroups">Réessayer</button>
      </div>

      <div v-else-if="allGroups.length === 0" class="text-center text-muted py-5">
        <i class="bi bi-people display-4"></i>
        <p class="mt-3">Aucun groupe pour le moment. Créez le premier !</p>
      </div>

      <div class="row" v-else>
        <div class="col-md-6 mb-4" v-for="group in allGroups" :key="group.id">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="group-icon me-3">
                  <i class="bi bi-people-fill display-4 text-primary"></i>
                </div>
                <div class="flex-grow-1">
                  <h5 class="card-title mb-1">
                    {{ group.name }}
                    <span v-if="group.privacy === 'private'" class="badge bg-secondary ms-1">Privé</span>
                  </h5>
                  <p class="text-muted mb-0">{{ group.members_count }} membre{{ group.members_count > 1 ? 's' : '' }}</p>
                </div>
              </div>

              <p class="card-text">{{ group.description }}</p>

              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex">
                  <img
                    v-for="member in (group.members || []).slice(0, 5)"
                    :key="member.id"
                    :src="avatarUrl(member.profile_picture)"
                    class="rounded-circle me-1"
                    width="24"
                    height="24"
                    :title="member.username"
                  >
                  <div v-if="group.members_count > 5" class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; font-size: 12px;">
                    +{{ group.members_count - 5 }}
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button
                    v-if="!group.is_member && group.privacy === 'public'"
                    class="btn btn-primary btn-sm"
                    @click="handleJoin(group)"
                  >
                    <i class="bi bi-plus"></i> Rejoindre
                  </button>
                  <button
                    v-else-if="group.is_member && !group.is_admin"
                    class="btn btn-outline-danger btn-sm"
                    @click="handleLeave(group)"
                  >
                    Quitter
                  </button>
                  <router-link :to="`/groups/${group.id}`" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-arrow-right"></i> Voir
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Créer un groupe (téléporté dans <body> pour que le fond gris ne le recouvre pas) -->
      <Teleport to="body">
      <div class="modal fade" id="createGroupModal" tabindex="-1" ref="createModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <form @submit.prevent="handleCreate">
              <div class="modal-header">
                <h5 class="modal-title">Créer un groupe</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label for="groupName" class="form-label">Nom du groupe</label>
                  <input
                    v-model="newGroup.name"
                    type="text"
                    class="form-control"
                    id="groupName"
                    maxlength="100"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="groupDescription" class="form-label">Description</label>
                  <textarea
                    v-model="newGroup.description"
                    class="form-control"
                    id="groupDescription"
                    rows="3"
                  ></textarea>
                </div>
                <div class="mb-3">
                  <label for="groupPrivacy" class="form-label">Confidentialité</label>
                  <select v-model="newGroup.privacy" class="form-select" id="groupPrivacy">
                    <option value="public">Public</option>
                    <option value="private">Privé</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="creating || !newGroup.name.trim()">
                  <span v-if="creating" class="spinner-border spinner-border-sm me-2"></span>
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </Teleport>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { mapGetters, mapActions } from 'vuex'
import { notify, errorMessage } from '../../services/notify'
import { avatarUrl } from '../../utils/format'

const emptyGroup = () => ({ name: '', description: '', privacy: 'public' })

export default {
  name: 'GroupsList',
  data() {
    return {
      newGroup: emptyGroup(),
      creating: false,
      loadError: null
    }
  },
  computed: {
    ...mapGetters('groups', ['allGroups', 'isLoading'])
  },
  methods: {
    ...mapActions('groups', ['fetchGroups', 'createGroup', 'joinGroup', 'leaveGroup']),
    avatarUrl,

    async loadGroups() {
      this.loadError = null
      try {
        await this.fetchGroups()
      } catch (error) {
        this.loadError = 'Impossible de charger les groupes'
      }
    },

    openCreateModal() {
      Modal.getOrCreateInstance(this.$refs.createModal).show()
    },

    async handleCreate() {
      if (!this.newGroup.name.trim()) return

      this.creating = true
      try {
        await this.createGroup(this.newGroup)
        this.newGroup = emptyGroup()
        Modal.getOrCreateInstance(this.$refs.createModal).hide()
        notify('Groupe créé !', 'success')
      } catch (error) {
        notify(errorMessage(error, 'Impossible de créer le groupe'), 'error')
      } finally {
        this.creating = false
      }
    },

    async handleJoin(group) {
      try {
        await this.joinGroup(group.id)
        notify(`Vous avez rejoint « ${group.name} »`, 'success')
      } catch (error) {
        notify(errorMessage(error, 'Impossible de rejoindre le groupe'), 'error')
      }
    },

    async handleLeave(group) {
      if (!confirm(`Quitter le groupe « ${group.name} » ?`)) return
      try {
        await this.leaveGroup(group.id)
        notify('Vous avez quitté le groupe', 'success')
      } catch (error) {
        notify(errorMessage(error, 'Impossible de quitter le groupe'), 'error')
      }
    }
  },
  created() {
    this.loadGroups()
  },
  beforeUnmount() {
    // Si on quitte la page modal ouvert, on retire aussi le fond gris laissé par Bootstrap
    Modal.getInstance(this.$refs.createModal)?.dispose()
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  }
}
</script>
