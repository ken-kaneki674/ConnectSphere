import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    groups: [],
    currentGroup: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_GROUPS(state, groups) {
      state.groups = groups
    },
    SET_CURRENT_GROUP(state, group) {
      state.currentGroup = group
    },
    ADD_GROUP(state, group) {
      state.groups.unshift(group)
    },
    UPDATE_GROUP(state, updatedGroup) {
      const index = state.groups.findIndex(g => g.id === updatedGroup.id)
      if (index !== -1) {
        state.groups.splice(index, 1, updatedGroup)
      }
    },
    REMOVE_GROUP(state, groupId) {
      state.groups = state.groups.filter(g => g.id !== groupId)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchGroups({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get('/groups')
        commit('SET_GROUPS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchGroup({ commit }, groupId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.get(`/groups/${groupId}`)
        commit('SET_CURRENT_GROUP', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createGroup({ commit }, groupData) {
      try {
        const response = await api.post('/groups', groupData)
        commit('ADD_GROUP', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    async updateGroup({ commit }, { groupId, groupData }) {
      try {
        const response = await api.put(`/groups/${groupId}`, groupData)
        commit('UPDATE_GROUP', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    async deleteGroup({ commit }, groupId) {
      try {
        await api.delete(`/groups/${groupId}`)
        commit('REMOVE_GROUP', groupId)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    async joinGroup({ commit }, groupId) {
      try {
        const response = await api.post(`/groups/${groupId}/join`)
        commit('UPDATE_GROUP', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    async leaveGroup({ commit }, groupId) {
      try {
        const response = await api.post(`/groups/${groupId}/leave`)
        commit('UPDATE_GROUP', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },
  getters: {
    allGroups: state => state.groups,
    currentGroup: state => state.currentGroup,
    getGroupById: state => groupId => state.groups.find(g => g.id === groupId),
    isLoading: state => state.loading,
    error: state => state.error
  }
}
