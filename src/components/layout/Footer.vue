<template>
  <footer class="bg-dark text-light py-4 mt-auto">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h5>ConnectSphere</h5>
          <p class="text-light-emphasis">Réseau social pour rester connecté avec vos amis.</p>
        </div>
        <div class="col-md-6">
          <h5>Liens</h5>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-light">Accueil</router-link></li>
            <li><router-link to="/feed" class="text-light">Fil d'actualité</router-link></li>
            <li><router-link to="/groups" class="text-light">Groupes</router-link></li>
            <li><router-link to="/messages" class="text-light">Messages</router-link></li>
          </ul>
        </div>
      </div>
      <hr class="bg-light">
      <div class="text-center">
        <p class="mb-0">&copy; {{ year }} ConnectSphere. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      year: new Date().getFullYear()
    }
  }
}
</script>

