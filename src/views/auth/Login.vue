<template>
  <div class="login-container">
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="login-card card fade-in-up">
            <div class="card-header text-center">
              <div class="brand-section">
                <div class="brand-icon">
                  <i class="bi bi-globe"></i>
                </div>
                <h3 class="brand-title">ConnectSphere</h3>
                <p class="brand-subtitle">Connectez-vous à votre compte</p>
              </div>
            </div>
            
            <div class="card-body">
              <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-floating mb-4">
                  <input 
                    v-model="form.username" 
                    type="text" 
                    class="form-control" 
                    id="username"
                    placeholder=" "
                    required
                  >
                  <label for="username" class="form-label">
                    <i class="bi bi-person me-2"></i>Nom d'utilisateur ou email
                  </label>
                </div>
                
                <div class="form-floating mb-4">
                  <input 
                    v-model="form.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="password"
                    placeholder=" "
                    required
                  >
                  <label for="password" class="form-label">
                    <i class="bi bi-lock me-2"></i>Mot de passe
                  </label>
                  <button 
                    type="button" 
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="btn btn-login w-100" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-box-arrow-in-right me-2"></i>
                    Connexion
                  </button>
                </div>
                
                <div v-if="error" class="alert alert-danger mt-3 fade-in-up">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{ error }}
                </div>
              </form>
              
              <div class="divider-section">
                <div class="divider">
                  <span>OU</span>
                </div>
              </div>
              
              <div class="text-center mt-4">
                <p class="register-prompt">
                  Pas encore de compte ? 
                  <router-link to="/register" class="register-link">
                    S'inscrire maintenant
                  </router-link>
                </p>
              </div>
              
              <div class="demo-section">
                <div class="demo-info">
                  <i class="bi bi-info-circle me-2"></i>
                  <span>Compte de démonstration :</span>
                </div>
                <div class="demo-credentials">
                  <div class="demo-field">
                    <small class="demo-label">Username:</small>
                    <code class="demo-value">demo</code>
                    <button type="button" @click="fillDemo" class="demo-fill-btn">
                      <i class="bi bi-arrow-right-circle"></i>
                    </button>
                  </div>
                  <div class="demo-field">
                    <small class="demo-label">Password:</small>
                    <code class="demo-value">demo</code>
                  </div>
                </div>
              </div>
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

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      showPassword: false,
      loading: false,
      error: null
    }
  },
  methods: {
    ...mapActions('auth', ['login']),

    async handleLogin() {
      this.loading = true
      this.error = null

      try {
        await this.login(this.form)
        notify('Connexion réussie !', 'success')
        const redirect = this.$route.query.redirect
        this.$router.push(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/feed')
      } catch (error) {
        const message = errorMessage(error, 'Erreur de connexion')
        this.error = message === 'Invalid credentials' ? 'Identifiants incorrects' : message
      } finally {
        this.loading = false
      }
    },

    fillDemo() {
      this.form.username = 'demo'
      this.form.password = 'demo'
      notify('Identifiants de démo remplis', 'info')
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

/* Animated Background Shapes */
.background-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float-shape 20s ease-in-out infinite;
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 10%;
  animation-delay: 5s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 15%;
  animation-delay: 10s;
}

@keyframes float-shape {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(30px) rotate(240deg); }
}

/* Login Card */
.login-card {
  border: none;
  border-radius: 25px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 3rem 2rem 2rem;
  border-radius: 25px 25px 0 0 !important;
}

.brand-section {
  position: relative;
}

.brand-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
  animation: pulse 2s infinite;
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Form Styles */
.card-body {
  padding: 3rem 2rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-floating {
  position: relative;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  background: white;
}

.form-label {
  color: #6c757d;
  font-weight: 600;
  z-index: 1;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check-input {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid #667eea;
}

.form-check-label {
  font-weight: 500;
  color: #495057;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: #667eea;
}

/* Buttons */
.form-actions {
  margin-top: 2rem;
}

.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 15px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-login:hover::before {
  left: 100%;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

/* Divider */
.divider-section {
  margin: 2rem 0;
}

.divider {
  text-align: center;
  position: relative;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #6c757d;
  font-weight: 500;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

/* Register Link */
.register-prompt {
  color: #6c757d;
  font-size: 1rem;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.register-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Demo Section */
.demo-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 2px dashed #dee2e6;
}

.demo-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: #495057;
  font-weight: 500;
}

.demo-credentials {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.demo-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.demo-label {
  font-weight: 600;
  color: #6c757d;
  margin-right: 1rem;
}

.demo-value {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  flex: 1;
}

.demo-fill-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.demo-fill-btn:hover {
  background: #764ba2;
  transform: scale(1.1);
}

/* Alert */
.alert {
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  animation: fadeInUp 0.5s ease-out;
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    margin: 1rem;
  }
  
  .card-header {
    padding: 2rem 1.5rem 1.5rem;
  }
  
  .card-body {
    padding: 2rem 1.5rem;
  }
  
  .brand-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .demo-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .demo-fill-btn {
    align-self: flex-end;
    margin-left: 0;
  }
}
</style>
