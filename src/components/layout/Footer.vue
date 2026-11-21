<template>
  <footer class="bg-dark text-light py-4 mt-auto">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h5>ConnectSphere</h5>
          <p class="text-muted">Réseau social pour rester connecté avec vos amis.</p>
        </div>
        <div class="col-md-6">
          <h5>Liens</h5>
          <ul class="list-unstyled">
            <li><router-link to="/about" class="text-light">À propos</router-link></li>
            <li><router-link to="/privacy" class="text-light">Confidentialité</router-link></li>
            <li><router-link to="/terms" class="text-light">Conditions d'utilisation</router-link></li>
            <li><router-link to="/contact" class="text-light">Contact</router-link></li>
          </ul>
        </div>
      </div>
      <hr class="bg-light">
      <div class="text-center">
        <p class="mb-0">&copy; 2024 ConnectSphere. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>
