<template>
  <div class="card mb-3" :data-post-id="post.id">
    <div class="card-header d-flex align-items-center">
      <img 
        :src="post.user.profile_picture || '/default-avatar.png'" 
        class="rounded-circle me-2" 
        width="40" 
        height="40"
      >
      <div class="flex-grow-1">
        <h6 class="mb-0">{{ post.user.username }}</h6>
        <small class="text-muted">{{ formatDate(post.created_at) }}</small>
      </div>
      <div class="dropdown">
        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-three-dots"></i>
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#">Signaler</a></li>
          <li><a class="dropdown-item" href="#" v-if="isCurrentUser">Supprimer</a></li>
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
          :class="{ 'active': isLiked }"
        >
          <i class="bi" :class="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
          <span class="like-count">{{ likesCount }}</span>
        </button>
        
        <button 
          class="btn btn-outline-secondary comment-toggle"
          @click="toggleComments"
        >
          <i class="bi bi-chat"></i> Commenter
        </button>
        
        <button class="btn btn-outline-secondary">
          <i class="bi bi-share"></i> Partager
        </button>
      </div>

      <!-- Section Commentaires -->
      <div class="comments-section" v-show="showComments">
        <div class="comment-form mb-3">
          <form @submit.prevent="handleComment">
            <div class="input-group">
              <input 
                v-model="newComment" 
                type="text" 
                class="form-control" 
                placeholder="Écrire un commentaire..."
                required
              >
              <button class="btn btn-primary" type="submit">Envoyer</button>
            </div>
          </form>
        </div>
        
        <div class="comments-list">
          <div v-if="commentsLoading" class="text-center">
            <div class="spinner-border spinner-border-sm"></div>
          </div>
          
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
  data() {
    return {
      showComments: false,
      newComment: ''
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('likes', ['getLikesByPost', 'getLikesCount']),
    ...mapGetters('comments', ['getCommentsByPost', 'isLoading']),
    
    likes() {
      return this.getLikesByPost(this.post.id)
    },
    likesCount() {
      return this.getLikesCount(this.post.id)
    },
    isLiked() {
      return this.likes.some(like => like.user_id === this.currentUser?.id)
    },
    comments() {
      return this.getCommentsByPost(this.post.id)
    },
    commentsLoading() {
      return this.isLoading
    },
    isCurrentUser() {
      return this.post.user_id === this.currentUser?.id
    }
  },
  methods: {
    ...mapActions('likes', ['toggleLike', 'fetchLikes']),
    ...mapActions('comments', ['fetchComments', 'createComment']),
    
    async handleLike() {
      this.$emit('like', this.post.id)
    },
    
    async handleComment() {
      if (!this.newComment.trim()) return
      
      this.$emit('comment', {
        postId: this.post.id,
        content: this.newComment
      })
      this.newComment = ''
    },
    
    async toggleComments() {
      this.showComments = !this.showComments
      if (this.showComments && this.comments.length === 0) {
        await this.fetchComments(this.post.id)
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>
