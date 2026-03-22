<template>
  <article class="card mb-4">
    <div class="flex items-start gap-3">
      <img :src="post.author.avatar || '/default-avatar.png'" :alt="post.author.username"
        class="w-10 h-10 rounded-full object-cover" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <div>
            <RouterLink :to="`/profile/${post.author.username}`" class="font-semibold text-gray-900 hover:underline">
              {{ post.author.displayName }}
            </RouterLink>
            <span class="text-gray-500 text-sm ml-1">@{{ post.author.username }}</span>
            <span class="text-gray-400 text-sm ml-2">· {{ formatDate(post.createdAt) }}</span>
          </div>
          <button v-if="isOwner" @click="$emit('delete', post._id)" class="text-gray-400 hover:text-red-500 transition-colors">
            ✕
          </button>
        </div>
        <p class="mt-1 text-gray-800 whitespace-pre-wrap">{{ post.content }}</p>
        <img v-if="post.image" :src="post.image" alt="Post image" class="mt-3 rounded-xl w-full object-cover max-h-96" />
        <div class="flex items-center gap-6 mt-3 text-gray-500">
          <button @click="$emit('like', post._id)" class="flex items-center gap-1.5 hover:text-social-like transition-colors"
            :class="{ 'text-social-like': post.isLiked }">
            <span>{{ post.isLiked ? '♥' : '♡' }}</span>
            <span class="text-sm">{{ post.likesCount || 0 }}</span>
          </button>
          <RouterLink :to="`/post/${post._id}`" class="flex items-center gap-1.5 hover:text-social-comment transition-colors">
            <span>💬</span>
            <span class="text-sm">{{ post.commentsCount || 0 }}</span>
          </RouterLink>
          <button class="flex items-center gap-1.5 hover:text-social-share transition-colors">
            <span>↗</span>
            <span class="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const props = defineProps({
  post: { type: Object, required: true }
})

defineEmits(['like', 'delete'])

const authStore = useAuthStore()
const isOwner = computed(() => authStore.user?._id === props.post.author._id)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return date.toLocaleDateString()
}
</script>
