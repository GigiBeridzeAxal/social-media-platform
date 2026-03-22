<template>
  <div class="card mb-4">
    <div class="flex gap-3">
      <img :src="authStore.user?.avatar || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover" />
      <div class="flex-1">
        <textarea v-model="content" placeholder="What's on your mind?"
          class="w-full resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-400 text-lg"
          rows="3" @keydown.ctrl.enter="submit" />
        <div v-if="imagePreview" class="relative mt-2">
          <img :src="imagePreview" class="rounded-xl max-h-60 object-cover" />
          <button @click="clearImage" class="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80">✕</button>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div class="flex gap-2">
            <label class="cursor-pointer text-primary-500 hover:text-primary-600 transition-colors">
              📷
              <input type="file" class="hidden" accept="image/*" @change="handleImage" />
            </label>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm" :class="remaining < 20 ? 'text-red-500' : 'text-gray-400'">{{ remaining }}</span>
            <button @click="submit" :disabled="!canSubmit" class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { usePostsStore } from '@/store/modules/posts'

const authStore = useAuthStore()
const postsStore = usePostsStore()

const content = ref('')
const imageFile = ref(null)
const imagePreview = ref(null)

const MAX_LENGTH = 280
const remaining = computed(() => MAX_LENGTH - content.value.length)
const canSubmit = computed(() => content.value.trim().length > 0 && remaining.value >= 0)

function handleImage(e) {
  const file = e.target.files[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function clearImage() {
  imageFile.value = null
  imagePreview.value = null
}

async function submit() {
  if (!canSubmit.value) return
  const formData = new FormData()
  formData.append('content', content.value.trim())
  if (imageFile.value) formData.append('image', imageFile.value)
  await postsStore.createPost(formData)
  content.value = ''
  clearImage()
}
</script>
