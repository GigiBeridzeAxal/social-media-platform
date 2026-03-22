import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  async function fetchNotifications() {
    loading.value = true
    try {
      const { data } = await api.get('/notifications')
      notifications.value = data
    } finally {
      loading.value = false
    }
  }

  async function markAllRead() {
    await api.put('/notifications/read-all')
    notifications.value.forEach(n => { n.read = true })
  }

  return { notifications, loading, unreadCount, fetchNotifications, markAllRead }
})
