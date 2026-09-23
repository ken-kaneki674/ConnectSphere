<template>
  <div class="comment mb-3">
    <div class="d-flex">
      <img
        :src="avatarUrl(comment.user.profile_picture)"
        class="rounded-circle me-2"
        width="32"
        height="32"
      >
      <div class="flex-grow-1">
        <div class="bg-light rounded p-2">
          <router-link :to="`/profile/${comment.user.id}`" class="text-decoration-none text-reset">
            <h6 class="mb-1">{{ comment.user.username }}</h6>
          </router-link>
          <p class="mb-0">{{ comment.content }}</p>
        </div>
        <small class="text-muted ms-2">
          {{ formatDate(comment.created_at) }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { avatarUrl, formatDate } from '../../utils/format'

export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    }
  },
  methods: {
    avatarUrl,
    formatDate
  }
}
</script>
