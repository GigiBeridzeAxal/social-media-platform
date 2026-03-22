<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <h1 class="text-xl font-bold text-gray-900 mb-4">Explore</h1>
    <div class="relative mb-6">
      <input v-model="query" @input="search" type="text" placeholder="Search users, posts, hashtags..."
        class="input-field pl-10" />
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
    </div>
    <div v-if="results.users?.length">
      <h2 class="font-semibold text-gray-700 mb-3">Users</h2>
      <div v-for="user in results.users" :key="user._id" class="card mb-3 flex items-center gap-3">
        <img :src="user.avatar || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex-1">
          <RouterLink :to="`/profile/${user.username}`" class="font-semibold hover:underline">{{ user.displayName }}</RouterLink>
          <p class="text-sm text-gray-500">@{{ user.username }} · {{ user.followersCount }} followers</p>
        </div>
      </div>
    </div>
    <div v-if="results.posts?.length" class="mt-4">
      <h2 class="font-semibold text-gray-700 mb-3">Posts</h2>
      <PostCard v-for="post in results.posts" :key="post._id" :post="post" @like="likePost" />
    </div>
    <div v-if="!query" class="text-center py-10 text-gray-400">Start typing to search...</div>
    <div v-else-if="!results.users?.length && !results.posts?.length && !loading" class="text-center py-10 text-gray-400">
      No results for "{{ query }}"
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import PostCard from '@/components/feed/PostCard.vue'
import api from '@/services/api'

const query = ref('')
const results = ref({})
const loading = ref(false)
let debounceTimer = null

async function search() {
  if (!query.value.trim()) { results.value = {}; return }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    loading.value = true
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(query.value)}`)
      results.value = data
    } finally {
      loading.value = false
    }
  }, 300)
}

async function likePost(postId) {
  const { data } = await api.post(`/posts/${postId}/like`)
  const post = results.value.posts?.find(p => p._id === postId)
  if (post) { post.likesCount = data.likesCount; post.isLiked = data.isLiked }
}
</script>
