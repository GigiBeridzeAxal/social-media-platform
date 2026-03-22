<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <div v-if="loading" class="text-center py-10 text-gray-400">Loading profile...</div>
    <div v-else-if="profile">
      <!-- Cover -->
      <div class="h-40 bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl mb-0"></div>
      <!-- Avatar + Actions -->
      <div class="flex items-end justify-between px-4 -mt-12 mb-4">
        <img :src="profile.avatar || '/default-avatar.png'" class="w-24 h-24 rounded-full border-4 border-white object-cover" />
        <div class="mb-2">
          <button v-if="isOwnProfile" @click="$router.push('/settings')" class="btn-secondary">Edit Profile</button>
          <button v-else @click="toggleFollow" class="btn-primary">
            {{ profile.isFollowing ? 'Unfollow' : 'Follow' }}
          </button>
        </div>
      </div>
      <!-- Info -->
      <div class="px-2 mb-6">
        <h1 class="text-xl font-bold text-gray-900">{{ profile.displayName }}</h1>
        <p class="text-gray-500">@{{ profile.username }}</p>
        <p v-if="profile.bio" class="text-gray-700 mt-2">{{ profile.bio }}</p>
        <div class="flex gap-4 mt-3 text-sm">
          <span><strong>{{ profile.followingCount }}</strong> <span class="text-gray-500">Following</span></span>
          <span><strong>{{ profile.followersCount }}</strong> <span class="text-gray-500">Followers</span></span>
          <span><strong>{{ profile.postsCount }}</strong> <span class="text-gray-500">Posts</span></span>
        </div>
      </div>
      <!-- Posts -->
      <PostCard v-for="post in posts" :key="post._id" :post="post"
        @like="likePost($event)"
        @delete="deletePost($event)" />
      <div v-if="!posts.length" class="text-center py-10 text-gray-400">No posts yet.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import PostCard from '@/components/feed/PostCard.vue'
import api from '@/services/api'

const route = useRoute()
const authStore = useAuthStore()

const profile = ref(null)
const posts = ref([])
const loading = ref(true)

const isOwnProfile = computed(() => authStore.user?.username === route.params.username)

async function fetchProfile() {
  loading.value = true
  try {
    const [profileRes, postsRes] = await Promise.all([
      api.get(`/users/${route.params.username}`),
      api.get(`/users/${route.params.username}/posts`)
    ])
    profile.value = profileRes.data
    posts.value = postsRes.data
  } finally {
    loading.value = false
  }
}

async function toggleFollow() {
  await api.post(`/users/${profile.value._id}/follow`)
  profile.value.isFollowing = !profile.value.isFollowing
  profile.value.followersCount += profile.value.isFollowing ? 1 : -1
}

async function likePost(postId) {
  const { data } = await api.post(`/posts/${postId}/like`)
  const post = posts.value.find(p => p._id === postId)
  if (post) { post.likesCount = data.likesCount; post.isLiked = data.isLiked }
}

async function deletePost(postId) {
  await api.delete(`/posts/${postId}`)
  posts.value = posts.value.filter(p => p._id !== postId)
}

onMounted(fetchProfile)
watch(() => route.params.username, fetchProfile)
</script>
