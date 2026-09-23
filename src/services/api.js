import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  timeout: 10000
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Session expirée : on nettoie et on renvoie vers la connexion
// (sauf pour les appels d'authentification, dont l'erreur doit s'afficher dans le formulaire)
api.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.startsWith('/auth/login') && !url.startsWith('/auth/register')) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
