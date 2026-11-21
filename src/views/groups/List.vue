<template>
  <div class="groups-list">
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-8">
          <h2><i class="bi bi-people"></i> Groupes</h2>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createGroupModal">
            <i class="bi bi-plus-circle"></i> Créer un groupe
          </button>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6 mb-4" v-for="group in groups" :key="group.id">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="group-icon me-3">
                  <i class="bi bi-people-fill display-4 text-primary"></i>
                </div>
                <div class="flex-grow-1">
                  <h5 class="card-title">{{ group.name }}</h5>
                  <p class="text-muted">{{ group.members_count }} membres</p>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Voir les détails</a></li>
                    <li><a class="dropdown-item" href="#">Paramètres</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#">Quitter le groupe</a></li>
                  </ul>
                </div>
              </div>
              
              <p class="card-text">{{ group.description }}</p>
              
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex">
                  <img 
                    v-for="member in group.members.slice(0, 5)" 
                    :key="member.id"
                    :src="member.profile_picture || '/default-avatar.png'" 
                    class="rounded-circle me-1" 
                    width="24" 
                    height="24"
                    :title="member.username"
                  >
                  <div v-if="group.members_count > 5" class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; font-size: 12px;">
                    +{{ group.members_count - 5 }}
                  </div>
                </div>
                
                <router-link :to="`/groups/${group.id}`" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-arrow-right"></i> Voir
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal Créer un groupe -->
      <div class="modal fade" id="createGroupModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Créer un groupe</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal">
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createGroup">
                <div class="mb-3">
                  <label for="groupName" class="form-label">Nom du groupe</label>
                  <input 
                    v-model="newGroup.name" 
                    type="text" 
                    class="form-control" 
                    id="groupName"
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
                  <select class="form-select" id="groupPrivacy">
                    <option value="public">Public</option>
                    <option value="private">Privé</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="button" class="btn btn-primary" @click="createGroup">Créer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GroupsList',
  data() {
    return {
      groups: [],
      newGroup: {
        name: '',
        description: '',
        privacy: 'public'
      }
    }
  },
  methods: {
    async fetchGroups() {
      // Simulation de données
      this.groups = [
        {
          id: 1,
          name: 'Développeurs Web',
          description: 'Groupe pour discuter de développement web',
          members_count: 156,
          members: [
            { id: 1, username: 'Alice', profile_picture: null },
            { id: 2, username: 'Bob', profile_picture: null },
            { id: 3, username: 'Charlie', profile_picture: null },
            { id: 4, username: 'David', profile_picture: null },
            { id: 5, username: 'Eve', profile_picture: null }
          ]
        },
        {
          id: 2,
          name: 'Design UI/UX',
          description: 'Partagez vos créations et obtenez des avis',
          members_count: 89,
          members: [
            { id: 6, username: 'Frank', profile_picture: null },
            { id: 7, username: 'Grace', profile_picture: null },
            { id: 8, username: 'Henry', profile_picture: null }
          ]
        }
      ]
    },
    
    async createGroup() {
      if (!this.newGroup.name.trim()) return
      
      // Simulation de création
      const group = {
        id: Date.now(),
        ...this.newGroup,
        members_count: 1,
        members: [{ id: 1, username: 'You', profile_picture: null }]
      }
      
      this.groups.unshift(group)
      this.newGroup = { name: '', description: '', privacy: 'public' }
      
      // Fermer le modal
      const modal = document.getElementById('createGroupModal')
      const bootstrapModal = bootstrap.Modal.getInstance(modal)
      bootstrapModal.hide()
    }
  },
  async created() {
    await this.fetchGroups()
  }
}
</script>
