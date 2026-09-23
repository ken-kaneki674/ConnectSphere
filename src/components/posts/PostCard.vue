<template>
  <div class="card mb-3" :data-post-id="post.id">
    <div class="card-header d-flex align-items-center">
      <img
        :src="avatarUrl(post.user.profile_picture)"
        class="rounded-circle me-2"
        width="40"
        height="40"
      >
      <div class="flex-grow-1">
        <router-link :to="`/profile/${post.user.id}`" class="text-decoration-none text-reset">
          <h6 class="mb-0">{{ post.user.username }}</h6>
        </router-link>
        <small class="text-muted">{{ formatDate(post.created_at) }}</small>
      </div>
      <div class="dropdown" v-if="isOwnPost">
        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-three-dots"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <a class="dropdown-item text-danger" href="#" @click.prevent="handleDelete">
              <i class="bi bi-trash me-2"></i>Supprimer
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="card-body">
      <p class="card-text">{{ post.content }}</p>

      <img
        v-if="post.image_path"
        :src="post.image_path"
        class="img-fluid rounded mb-3"
        :alt="post.content"
      >

      <div class="d-flex gap-3 mb-3">
        <button
          class="btn btn-outline-primary like-btn"
          @click="handleLike"
          :class="{ 'active': post.liked }"
          :disabled="!isAuthenticated || liking"
        >
          <i class="bi" :class="post.liked ? 'bi-heart-fill' : 'bi-heart'"></i>
          <span class="like-count ms-1">{{ post.likes_count || 0 }}</span>
        </button>

        <button
          class="btn btn-outline-secondary comment-toggle"
          @click="toggleComments"
        >
          <i class="bi bi-chat"></i> Commentaires ({{ commentsCount }})
        </button>
      </div>

      <!-- Section Commentaires -->
      <div class="comments-section" v-show="showComments">
        <div class="comment-form mb-3" v-if="isAuthenticated">
          <form @submit.prevent="handleComment">
            <div class="input-group">
              <input
                v-model="newComment"
                type="text"
                class="form-control"
                placeholder="Écrire un commentaire..."
                required
              >
              <button class="btn btn-primary" type="submit" :disabled="!newComment.trim()">Envoyer</button>
            </div>
          </form>
        </div>

        <div class="comments-list">
          <div v-if="commentsLoading" class="text-center">
            <div class="spinner-border spinner-border-sm"></div>
          </div>

          <p v-else-if="comments.length === 0" class="text-muted small mb-0">Aucun commentaire.</p>

          <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CommentItem from './CommentItem.vue'
import { notify, errorMessage } from '../../services/notify'
import { avatarUrl, formatDate } from '../../utils/format'

export default {
  name: 'PostCard',
  components: {
    CommentItem
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  emits: ['deleted', 'updated'],
  data() {
    return {
      showComments: false,
      newComment: '',
      liking: false
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser', 'isAuthenticated']),
    comments() {
      return this.$store.getters['comments/getCommentsByPost'](this.post.id)
    },
    commentsLoading() {
      return this.$store.getters['comments/isLoading'](this.post.id)
    },
    commentsCount() {
      return this.$store.getters['comments/hasLoaded'](this.post.id)
        ? this.comments.length
        : (this.post.comments_count || 0)
    },
    isOwnPost() {
      return !!this.currentUser && this.post.user_id === this.currentUser.id
    }
  },
  methods: {
    ...mapActions('likes', ['toggleLike']),
    ...mapActions('comments', ['fetchComments', 'createComment']),
    ...mapActions('posts', ['deletePost']),
    avatarUrl,
    formatDate,

    async handleLike() {
      this.liking = true
      try {
        const result = await this.toggleLike(this.post.id)
        this.$emit('updated', { id: this.post.id, ...result })
      } catch (error) {
        notify(errorMessage(error, 'Impossible d\'aimer cette publication'), 'error')
      } finally {
        this.liking = false
      }
    },

    async handleComment() {
      const content = this.newComment.trim()
      if (!content) return

      try {
        await this.createComment({ postId: this.post.id, content })
        this.newComment = ''
      } catch (error) {
        notify(errorMessage(error, 'Impossible d\'ajouter le commentaire'), 'error')
      }
    },

    async handleDelete() {
      if (!confirm('Supprimer cette publication ?')) return
      try {
        await this.deletePost(this.post.id)
        this.$emit('deleted', this.post.id)
        notify('Publication supprimée', 'success')
      } catch (error) {
        notify(errorMessage(error, 'Suppression impossible'), 'error')
      }
    },

    async toggleComments() {
      this.showComments = !this.showComments
      if (this.showComments && !this.$store.getters['comments/hasLoaded'](this.post.id)) {
        try {
          await this.fetchComments(this.post.id)
        } catch (error) {
          notify('Impossible de charger les commentaires', 'error')
        }
      }
    }
  }
}
</script>
