import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const usePostsStore = defineStore('posts', () => {
  const feed = ref([])
  const loading = ref(false)
  const page = ref(1)
  const hasMore = ref(true)

  async function fetchFeed(reset = false) {
    if (reset) { feed.value = []; page.value = 1; hasMore.value = true }
    if (!hasMore.value || loading.value) return
    loading.value = true
    try {
      const { data } = await api.get(`/posts/feed?page=${page.value}&limit=10`)
      feed.value.push(...data.posts)
      hasMore.value = data.hasMore
      page.value++
    } finally {
      loading.value = false
    }
  }

  async function createPost(postData) {
    const { data } = await api.post('/posts', postData)
    feed.value.unshift(data)
    return data
  }

  async function likePost(postId) {
    const { data } = await api.post(`/posts/${postId}/like`)
    const post = feed.value.find(p => p._id === postId)
    if (post) { post.likesCount = data.likesCount; post.isLiked = data.isLiked }
  }

  async function deletePost(postId) {
    await api.delete(`/posts/${postId}`)
    feed.value = feed.value.filter(p => p._id !== postId)
  }

  return { feed, loading, hasMore, fetchFeed, createPost, likePost, deletePost }
})
