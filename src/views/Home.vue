<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="hero-title fade-in-up">
            <i class="bi bi-globe me-3"></i>ConnectSphere
          </h1>
          <p class="hero-subtitle fade-in-up">
            Le réseau social moderne pour rester connecté avec vos amis
          </p>
          
          <div class="hero-buttons fade-in-up">
            <div v-if="!isAuthenticated" class="hero-actions">
              <router-link to="/register" class="btn btn-hero btn-primary me-3">
                <i class="bi bi-person-plus me-2"></i> S'inscrire
              </router-link>
              <router-link to="/login" class="btn btn-hero btn-outline-light">
                <i class="bi bi-box-arrow-in-right me-2"></i> Se connecter
              </router-link>
            </div>
            
            <div v-else class="welcome-back">
              <h3 class="welcome-text">Bienvenue de retour !</h3>
              <router-link to="/feed" class="btn btn-hero btn-primary">
                <i class="bi bi-house me-2"></i> Accéder au fil d'actualité
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Animated Background Elements -->
      <div class="floating-elements">
        <div class="floating-element element-1"></div>
        <div class="floating-element element-2"></div>
        <div class="floating-element element-3"></div>
        <div class="floating-element element-4"></div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2 class="section-title">Découvrez nos fonctionnalités</h2>
          <p class="section-subtitle">Tout ce dont vous avez besoin pour rester connecté</p>
        </div>
        
        <div class="row g-4">
          <div class="col-lg-4 col-md-6">
            <div class="feature-card card h-100 fade-in-up">
              <div class="feature-icon">
                <i class="bi bi-chat-square-text"></i>
              </div>
              <h3 class="feature-title">Publications</h3>
              <p class="feature-description">
                Partagez vos pensées, photos et moments avec votre communauté
              </p>
              <div class="feature-features">
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Texte riche</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Images</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Vidéos</span>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6">
            <div class="feature-card card h-100 fade-in-up">
              <div class="feature-icon">
                <i class="bi bi-heart"></i>
              </div>
              <h3 class="feature-title">Interactions</h3>
              <p class="feature-description">
                Likez, commentez et interagissez avec les publications de vos amis
              </p>
              <div class="feature-features">
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Réactions</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Commentaires</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Partages</span>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6">
            <div class="feature-card card h-100 fade-in-up">
              <div class="feature-icon">
                <i class="bi bi-people"></i>
              </div>
              <h3 class="feature-title">Communauté</h3>
              <p class="feature-description">
                Rejoignez des groupes, créez des communautés et partagez vos passions
              </p>
              <div class="feature-features">
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Groupes</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Événements</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Discussions</span>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6">
            <div class="feature-card card h-100 fade-in-up">
              <div class="feature-icon">
                <i class="bi bi-envelope"></i>
              </div>
              <h3 class="feature-title">Messagerie</h3>
              <p class="feature-description">
                Discutez en privé avec vos amis et partagez des fichiers
              </p>
              <div class="feature-features">
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Chat instantané</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Fichiers</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Vidéos</span>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6">
            <div class="feature-card card h-100 fade-in-up">
              <div class="feature-icon">
                <i class="bi bi-shield-check"></i>
              </div>
              <h3 class="feature-title">Sécurité</h3>
              <p class="feature-description">
                Vos données sont protégées avec le chiffrement moderne
              </p>
              <div class="feature-features">
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>2FA</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Chiffrement</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Contrôle</span>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6">
            <div class="feature-card card h-100 fade-in-up">
              <div class="feature-icon">
                <i class="bi bi-palette"></i>
              </div>
              <h3 class="feature-title">Personnalisation</h3>
              <p class="feature-description">
                Personnalisez votre profil et votre expérience utilisateur
              </p>
              <div class="feature-features">
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Thèmes</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Profils</span>
                <span class="badge feature-badge"><i class="bi bi-check-circle me-1"></i>Widgets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item fade-in-up">
              <div class="stat-number">{{ stats.users }}</div>
              <div class="stat-label">Utilisateurs</div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item fade-in-up">
              <div class="stat-number">{{ stats.posts }}</div>
              <div class="stat-label">Publications</div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item fade-in-up">
              <div class="stat-number">{{ stats.groups }}</div>
              <div class="stat-label">Groupes</div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item fade-in-up">
              <div class="stat-number">{{ stats.messages }}</div>
              <div class="stat-label">Messages</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  data() {
    return {
      stats: {
        users: '10K+',
        posts: '50K+',
        groups: '1K+',
        messages: '100K+'
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },
  mounted() {
    // Animation d'entrée des éléments
    this.animateElements()
  },
  methods: {
    animateElements() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      })
      
      document.querySelectorAll('.fade-in-up').forEach(el => {
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        el.style.transition = 'all 0.6s ease-out'
        observer.observe(el)
      })
    }
  }
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5rem 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  font-weight: 300;
}

.hero-buttons {
  margin-bottom: 2rem;
}

.btn-hero {
  padding: 15px 35px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-hero:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.btn-outline-light:hover {
  background: white;
  color: #667eea !important;
}

.welcome-text {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* Floating Elements */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.element-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.element-3 {
  width: 40px;
  height: 40px;
  top: 30%;
  right: 30%;
  animation-delay: 4s;
}

.element-4 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Features Section */
.features-section {
  padding: 5rem 0;
  background: #f8f9fa;
}

.section-header {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  font-weight: 300;
}

.feature-card {
  text-align: center;
  padding: 2.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-15px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 90px;
  height: 90px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-description {
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.feature-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Stats Section */
.stats-section {
  padding: 4rem 0;
  background: white;
}

.stat-item {
  padding: 2rem;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #f8f9fa;
  transform: translateY(-5px);
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .feature-card {
    padding: 2rem;
  }
}
</style>
