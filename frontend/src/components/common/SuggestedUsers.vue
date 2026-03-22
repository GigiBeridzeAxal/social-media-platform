<template>
  <div>
    <h3 class="font-semibold text-gray-900 mb-3">Who to follow</h3>
    <div v-if="loading" class="text-gray-400 text-sm">Loading...</div>
    <div v-else class="flex flex-col gap-3">
      <div v-for="user in users" :key="user._id" class="flex items-center gap-3">
        <img :src="user.avatar || '/default-avatar.png'" class="w-9 h-9 rounded-full object-cover" />
        <div class="flex-1 min-w-0">
          <RouterLink :to="`/profile/${user.username}`" class="font-semibold text-sm text-gray-900 hover:underline block truncate">
            {{ user.displayName }}
          </RouterLink>
          <span class="text-xs text-gray-500 truncate block">@{{ user.username }}</span>
        </div>
        <button @click="follow(user)" class="btn-secondary text-xs py-1 px-3">
          {{ user.isFollowing ? 'Unfollow' : 'Follow' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const users = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/users/suggested')
    users.value = data
  } finally {
    loading.value = false
  }
})

async function follow(user) {
  await api.post(`/users/${user._id}/follow`)
  user.isFollowing = !user.isFollowing
}
</script>
