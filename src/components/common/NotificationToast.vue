<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">
    <div 
      class="toast show align-items-center border-0" 
      :class="toastClasses"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          <i :class="iconClass" class="me-2"></i>
          {{ message }}
        </div>
        <button 
          type="button" 
          class="btn-close me-2 m-auto" 
          @click="closeToast"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationToast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    }
  },
  computed: {
    toastClasses() {
      return {
        'toast-success': this.type === 'success',
        'toast-error': this.type === 'error',
        'toast-warning': this.type === 'warning',
        'toast-info': this.type === 'info'
      }
    },
    iconClass() {
      const icons = {
        success: 'bi bi-check-circle-fill',
        error: 'bi bi-exclamation-triangle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
        info: 'bi bi-info-circle-fill'
      }
      return icons[this.type]
    }
  },
  methods: {
    closeToast() {
      this.$emit('close')
    }
  },
  mounted() {
    setTimeout(() => {
      this.closeToast()
    }, 5000)
  }
}
</script>

<style scoped>
.toast {
  min-width: 300px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.toast-success {
  background: linear-gradient(135deg, #43B581, #2ecc71);
  color: white;
}

.toast-error {
  background: linear-gradient(135deg, #F04747, #e74c3c);
  color: white;
}

.toast-warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.toast-info {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.toast-body {
  font-weight: 500;
}

.btn-close {
  filter: brightness(0) invert(1);
}
</style>
