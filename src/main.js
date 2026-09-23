import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap"
import "./assets/css/custom.css"

async function bootstrapApp() {
  // Restaure la session si un token est déjà présent
  if (store.getters['auth/token']) {
    try {
      await store.dispatch('auth/fetchProfile')
    } catch (error) {
      store.commit('auth/LOGOUT')
    }
  }

  createApp(App).use(store).use(router).mount('#app')
}

bootstrapApp()
