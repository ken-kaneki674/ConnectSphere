// Petit bus d'événements pour les notifications globales
// (Vue 3 a supprimé $on/$emit sur $root, utilisés auparavant)
const listeners = new Set()

export function onNotify(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notify(message, type = 'info') {
  listeners.forEach(listener => listener(message, type))
}

// Extrait un message lisible d'une erreur axios
export function errorMessage(error, fallback = 'Une erreur est survenue') {
  return error?.response?.data?.error || error?.response?.data?.message || fallback
}
