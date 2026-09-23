<template>
  <header class="navbar navbar-expand-lg navbar-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-globe"></i> ConnectSphere
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mx-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/feed">
              <i class="bi bi-house"></i> Accueil
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link" to="/messages">
              <i class="bi bi-envelope"></i> Messages
              <span v-if="unreadCount > 0" class="badge bg-danger ms-1">{{ unreadCount }}</span>
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link" to="/groups">
              <i class="bi bi-people"></i> Groupes
            </router-link>
          </li>
        </ul>

        <!-- Search Bar -->
        <div class="search-wrapper me-3" v-if="isAuthenticated">
          <SearchBar
            placeholder="Rechercher un utilisateur..."
            @search-submit="handleSearchSubmit"
          />
        </div>

        <ul class="navbar-nav">
          <li class="nav-item dropdown" v-if="isAuthenticated">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
              <img
                :src="avatarUrl(currentUser.profile_picture)"
                class="user-avatar me-2"
                :alt="currentUser.username"
              >
              <span>{{ currentUser.username }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" :to="`/profile/${currentUser.id}`">
                  <i class="bi bi-person me-2"></i> Mon profil
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i> Déconnexion
                </a>
              </li>
            </ul>
          </li>
          <li class="nav-item" v-else>
            <router-link class="nav-link btn btn-primary text-white px-3" to="/login">
              <i class="bi bi-box-arrow-in-right"></i> Connexion
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SearchBar from '../common/SearchBar.vue'
import { notify } from '../../services/notify'
import { avatarUrl } from '../../utils/format'

const POLL_INTERVAL = 30000

export default {
  name: 'Header',
  components: {
    SearchBar
  },
  computed: {
    ...mapGetters('auth', ['currentUser', 'isAuthenticated']),
    ...mapGetters('messages', ['unreadCount'])
  },
  watch: {
    // Rafraîchit le compteur de messages non lus tant que l'utilisateur est connecté
    isAuthenticated: {
      immediate: true,
      handler(value) {
        clearInterval(this.pollTimer)
        if (value) {
          this.refreshUnread()
          this.pollTimer = setInterval(this.refreshUnread, POLL_INTERVAL)
        }
      }
    }
  },
  beforeUnmount() {
    clearInterval(this.pollTimer)
  },
  methods: {
    ...mapActions('auth', ['logout']),
    ...mapActions('messages', ['fetchConversations']),
    avatarUrl,

    refreshUnread() {
      this.fetchConversations().catch(() => {})
    },

    async handleLogout() {
      await this.logout()
      this.$router.push('/login')
      notify('Déconnecté avec succès', 'success')
    },

    handleSearchSubmit(query) {
      if (!query.trim()) return
      this.$router.push({ name: 'Search', query: { q: query.trim() } })
    }
  }
}
</script>

<style scoped>
.navbar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.nav-link {
  font-weight: 500;
  color: #495057 !important;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 8px 16px !important;
  margin: 0 4px;
  position: relative;
}

.nav-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #667eea;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
  border-color: #764ba2;
}

.search-wrapper {
  flex: 1;
  max-width: 400px;
}

.badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.dropdown-menu {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  margin-top: 10px;
}

.dropdown-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 2px 8px;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  transform: translateX(5px);
}

.navbar-toggler {
  border: none;
  padding: 4px 8px;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}
</style>
