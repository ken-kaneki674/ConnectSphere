<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <i class="bi bi-search search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        @input="handleSearch"
        @keyup.enter="performSearch"
      />
      <button
        v-if="searchQuery"
        class="clear-btn"
        @click="clearSearch"
      >
        <i class="bi bi-x-circle"></i>
      </button>
    </div>

    <div v-if="showSuggestions && suggestions.length > 0" class="search-suggestions">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        <img
          :src="avatarUrl(suggestion.avatar)"
          class="suggestion-avatar"
        />
        <div class="suggestion-content">
          <div class="suggestion-name">{{ suggestion.name }}</div>
          <div class="suggestion-type">{{ suggestion.type }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { avatarUrl } from '../../utils/format'

export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: 'Rechercher...'
    },
    suggestions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['search', 'search-submit', 'clear', 'select'],
  data() {
    return {
      searchQuery: '',
      showSuggestions: false
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    avatarUrl,
    handleSearch() {
      this.showSuggestions = this.searchQuery.length > 0
      this.$emit('search', this.searchQuery)
    },
    performSearch() {
      this.showSuggestions = false
      this.$emit('search-submit', this.searchQuery)
    },
    clearSearch() {
      this.searchQuery = ''
      this.showSuggestions = false
      this.$emit('clear')
    },
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.name
      this.showSuggestions = false
      this.$emit('select', suggestion)
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showSuggestions = false
      }
    }
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.search-icon {
  position: absolute;
  left: 20px;
  color: #6c757d;
  font-size: 1.1rem;
  z-index: 2;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 50px 12px 20px;
  font-size: 1rem;
  outline: none;
  width: 100%;
}

.clear-btn {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f8f9fa;
}

.suggestion-item:hover {
  background: #f8f9fa;
  transform: translateX(5px);
}

.suggestion-item:first-child {
  border-radius: 15px 15px 0 0;
}

.suggestion-item:last-child {
  border-radius: 0 0 15px 15px;
  border-bottom: none;
}

.suggestion-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid #e9ecef;
}

.suggestion-content {
  flex: 1;
}

.suggestion-name {
  font-weight: 600;
  color: #495057;
  margin-bottom: 2px;
}

.suggestion-type {
  font-size: 0.85rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
