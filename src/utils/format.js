import defaultAvatar from '../assets/default-avatar.svg'

export function avatarUrl(picture) {
  return picture || defaultAvatar
}

export function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
