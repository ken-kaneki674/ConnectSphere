<template>
  <div class="comment mb-3">
    <div class="d-flex">
      <img 
        :src="comment.user.profile_picture || '/default-avatar.png'" 
        class="rounded-circle me-2" 
        width="32" 
        height="32"
      >
      <div class="flex-grow-1">
        <div class="bg-light rounded p-2">
          <h6 class="mb-1">{{ comment.user.username }}</h6>
          <p class="mb-0">{{ comment.content }}</p>
        </div>
        <small class="text-muted ms-2">
          {{ formatDate(comment.created_at) }}
          <button class="btn btn-sm btn-link text-muted p-0 ms-2">
            <i class="bi bi-heart"></i>
          </button>
          <button class="btn btn-sm btn-link text-muted p-0 ms-1">
            Répondre
          </button>
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>
