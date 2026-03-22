<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-xl font-bold text-gray-900 mb-4">Messages</h1>
    <div class="flex h-[calc(100vh-160px)] border border-gray-200 rounded-xl overflow-hidden bg-white">
      <!-- Conversations list -->
      <div class="w-80 border-r border-gray-200 overflow-y-auto">
        <div v-for="conv in conversations" :key="conv._id" @click="selectConversation(conv)"
          class="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
          :class="{ 'bg-primary-50': activeConv?._id === conv._id }">
          <img :src="conv.participant.avatar || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-gray-900 truncate">{{ conv.participant.displayName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ conv.lastMessage?.content }}</p>
          </div>
          <span v-if="conv.unread" class="w-2 h-2 bg-primary-500 rounded-full"></span>
        </div>
      </div>
      <!-- Chat area -->
      <div class="flex-1 flex flex-col">
        <div v-if="!activeConv" class="flex-1 flex items-center justify-center text-gray-400">
          Select a conversation
        </div>
        <template v-else>
          <div class="p-4 border-b border-gray-200">
            <p class="font-semibold">{{ activeConv.participant.displayName }}</p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <div v-for="msg in messages" :key="msg._id" class="flex" :class="msg.isMine ? 'justify-end' : 'justify-start'">
              <div class="max-w-xs px-4 py-2 rounded-2xl text-sm" :class="msg.isMine ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-900'">
                {{ msg.content }}
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-gray-200 flex gap-2">
            <input v-model="newMessage" @keydown.enter="sendMessage" type="text" placeholder="Type a message..."
              class="input-field flex-1" />
            <button @click="sendMessage" class="btn-primary">Send</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const conversations = ref([])
const activeConv = ref(null)
const messages = ref([])
const newMessage = ref('')

onMounted(async () => {
  const { data } = await api.get('/messages/conversations')
  conversations.value = data
})

async function selectConversation(conv) {
  activeConv.value = conv
  const { data } = await api.get(`/messages/conversations/${conv._id}/messages`)
  messages.value = data
}

async function sendMessage() {
  if (!newMessage.value.trim() || !activeConv.value) return
  const { data } = await api.post(`/messages/conversations/${activeConv.value._id}/messages`, {
    content: newMessage.value.trim()
  })
  messages.value.push(data)
  newMessage.value = ''
}
</script>
