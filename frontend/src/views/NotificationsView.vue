<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-gray-900">Notifications</h1>
      <button v-if="notifStore.unreadCount > 0" @click="notifStore.markAllRead()" class="text-sm text-primary-600 hover:underline">
        Mark all read
      </button>
    </div>
    <div v-if="notifStore.loading" class="text-center py-10 text-gray-400">Loading...</div>
    <div v-else-if="!notifStore.notifications.length" class="text-center py-10 text-gray-400">No notifications yet.</div>
    <div v-else class="flex flex-col gap-2">
      <div v-for="notif in notifStore.notifications" :key="notif._id"
        class="card flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
        :class="{ 'border-l-2 border-primary-500': !notif.read }">
        <img :src="notif.from?.avatar || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex-1">
          <p class="text-sm text-gray-800">
            <RouterLink :to="`/profile/${notif.from?.username}`" class="font-semibold hover:underline">
              {{ notif.from?.displayName }}
            </RouterLink>
            {{ notifText(notif) }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(notif.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useNotificationsStore } from '@/store/modules/notifications'

const notifStore = useNotificationsStore()

onMounted(() => notifStore.fetchNotifications())

function notifText(n) {
  const map = { like: 'liked your post', comment: 'commented on your post', follow: 'started following you', mention: 'mentioned you' }
  return map[n.type] || n.type
}

function formatDate(d) {
  const diff = Date.now() - new Date(d)
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(d).toLocaleDateString()
}
</script>
