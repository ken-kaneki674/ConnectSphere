<template>
  <div class="register-container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-header text-center">
            <h3><i class="bi bi-globe"></i> ConnectSphere</h3>
            <p class="text-muted">Créez votre compte</p>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="username" class="form-label">Nom d'utilisateur</label>
                <input
                  v-model="form.username"
                  type="text"
                  class="form-control"
                  id="username"
                  maxlength="50"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  id="email"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Mot de passe</label>
                <input
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  id="password"
                  minlength="6"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="password_confirm" class="form-label">Confirmer le mot de passe</label>
                <input
                  v-model="form.password_confirm"
                  type="password"
                  class="form-control"
                  id="password_confirm"
                  required
                >
              </div>

              <div v-if="error" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                S'inscrire
              </button>
            </form>

            <div class="text-center mt-3">
              <router-link to="/login" class="text-decoration-none">
                Déjà un compte ? Connectez-vous
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { notify, errorMessage } from '../../services/notify'

const ERRORS = {
  'User already exists': 'Ce nom d\'utilisateur ou cet email est déjà utilisé',
  'Password must be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
  'All fields required': 'Tous les champs sont obligatoires'
}

export default {
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        password_confirm: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    ...mapActions('auth', ['register']),

    async handleRegister() {
      if (this.form.password !== this.form.password_confirm) {
        this.error = 'Les mots de passe ne correspondent pas'
        return
      }

      this.loading = true
      this.error = null

      try {
        await this.register(this.form)
        notify('Compte créé ! Vous pouvez vous connecter.', 'success')
        this.$router.push('/login')
      } catch (error) {
        const message = errorMessage(error, 'Erreur d\'inscription')
        this.error = ERRORS[message] || message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
}
</style>
