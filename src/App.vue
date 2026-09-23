<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <div class="container-fluid">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    <Footer />

    <!-- Notifications -->
    <div class="notifications-container">
      <NotificationToast
        v-for="notification in notifications"
        :key="notification.id"
        :message="notification.message"
        :type="notification.type"
        @close="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<script>
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import NotificationToast from './components/common/NotificationToast.vue'
import { onNotify } from './services/notify'

let nextNotificationId = 1

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    NotificationToast
  },
  data() {
    return {
      notifications: []
    }
  },
  methods: {
    showNotification(message, type = 'info') {
      this.notifications.push({ id: nextNotificationId++, message, type })
    },
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  },
  mounted() {
    // Système global de notifications
    this.unsubscribe = onNotify(this.showNotification)
  },
  beforeUnmount() {
    this.unsubscribe()
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.notifications-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notifications-container > * {
  pointer-events: auto;
  margin-bottom: 10px;
}
</style>
