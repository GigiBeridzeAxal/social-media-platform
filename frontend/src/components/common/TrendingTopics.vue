<template>
  <div>
    <h3 class="font-semibold text-gray-900 mb-3">Trending</h3>
    <div class="flex flex-col gap-2">
      <div v-for="topic in topics" :key="topic.tag" class="p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
        <span class="text-xs text-gray-500">Trending</span>
        <p class="font-semibold text-gray-900 text-sm">#{{ topic.tag }}</p>
        <span class="text-xs text-gray-400">{{ topic.count }} posts</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const topics = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/posts/trending')
    topics.value = data
  } catch {
    topics.value = [
      { tag: 'vuejs', count: '1.2K' },
      { tag: 'nodejs', count: '980' },
      { tag: 'webdev', count: '756' },
      { tag: 'javascript', count: '543' }
    ]
  }
})
</script>
