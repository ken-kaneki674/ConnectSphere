<template>
  <div class="loading-container">
    <div class="loading-content">
      <div class="spinner-wrapper">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      <p class="loading-text mt-3">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Chargement en cours...'
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-content {
  text-align: center;
}

.spinner-wrapper {
  position: relative;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.loading-text {
  color: #6c757d;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
