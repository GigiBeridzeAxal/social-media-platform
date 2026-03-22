<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <h1 class="text-xl font-bold text-gray-900 mb-4">Home</h1>
    <CreatePost />
    <div v-if="postsStore.loading && !postsStore.feed.length" class="text-center py-10 text-gray-400">
      Loading feed...
    </div>
    <div v-else>
      <PostCard v-for="post in postsStore.feed" :key="post._id" :post="post"
        @like="postsStore.likePost($event)"
        @delete="postsStore.deletePost($event)" />
      <div v-if="postsStore.hasMore" class="text-center py-4">
        <button @click="postsStore.fetchFeed()" :disabled="postsStore.loading"
          class="btn-secondary disabled:opacity-50">
          {{ postsStore.loading ? 'Loading...' : 'Load more' }}
        </button>
      </div>
      <div v-else class="text-center py-4 text-gray-400 text-sm">You're all caught up!</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePostsStore } from '@/store/modules/posts'
import CreatePost from '@/components/feed/CreatePost.vue'
import PostCard from '@/components/feed/PostCard.vue'

const postsStore = usePostsStore()

onMounted(() => postsStore.fetchFeed(true))
</script>
