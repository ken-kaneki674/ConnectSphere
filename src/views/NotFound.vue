<template>
  <div class="container text-center py-5">
    <i class="bi bi-compass display-1 text-muted"></i>
    <h2 class="mt-3">Page introuvable</h2>
    <p class="text-muted">La page que vous cherchez n'existe pas ou a été déplacée.</p>
    <router-link to="/" class="btn btn-primary">Retour à l'accueil</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>
