<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
      ← Back
    </button>
    <div v-if="loading" class="text-center py-10 text-gray-400">Loading post...</div>
    <div v-else-if="post">
      <PostCard :post="post" @like="likePost" @delete="deletePost" />
      <!-- Comments -->
      <div class="card mt-2">
        <h3 class="font-semibold text-gray-900 mb-4">Comments ({{ comments.length }})</h3>
        <div class="flex gap-3 mb-6">
          <img :src="authStore.user?.avatar || '/default-avatar.png'" class="w-9 h-9 rounded-full object-cover" />
          <div class="flex-1 flex gap-2">
            <input v-model="newComment" @keydown.enter="submitComment" type="text"
              placeholder="Write a comment..." class="input-field flex-1" />
            <button @click="submitComment" class="btn-primary">Post</button>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div v-for="comment in comments" :key="comment._id" class="flex gap-3">
            <img :src="comment.author.avatar || '/default-avatar.png'" class="w-9 h-9 rounded-full object-cover" />
            <div class="flex-1 bg-gray-50 rounded-xl px-3 py-2">
              <RouterLink :to="`/profile/${comment.author.username}`" class="font-semibold text-sm hover:underline">
                {{ comment.author.displayName }}
              </RouterLink>
              <p class="text-sm text-gray-700 mt-0.5">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import PostCard from '@/components/feed/PostCard.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const post = ref(null)
const comments = ref([])
const loading = ref(true)
const newComment = ref('')

onMounted(async () => {
  try {
    const [postRes, commentsRes] = await Promise.all([
      api.get(`/posts/${route.params.id}`),
      api.get(`/posts/${route.params.id}/comments`)
    ])
    post.value = postRes.data
    comments.value = commentsRes.data
  } finally {
    loading.value = false
  }
})

async function likePost(postId) {
  const { data } = await api.post(`/posts/${postId}/like`)
  post.value.likesCount = data.likesCount
  post.value.isLiked = data.isLiked
}

async function deletePost(postId) {
  await api.delete(`/posts/${postId}`)
  router.push('/')
}

async function submitComment() {
  if (!newComment.value.trim()) return
  const { data } = await api.post(`/posts/${route.params.id}/comments`, { content: newComment.value.trim() })
  comments.value.push(data)
  post.value.commentsCount = (post.value.commentsCount || 0) + 1
  newComment.value = ''
}
</script>
