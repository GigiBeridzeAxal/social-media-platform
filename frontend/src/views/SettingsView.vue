<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <h1 class="text-xl font-bold text-gray-900 mb-6">Settings</h1>
    <div class="card mb-4">
      <h2 class="font-semibold text-gray-900 mb-4">Edit Profile</h2>
      <form @submit.prevent="saveProfile" class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <img :src="preview || form.avatar || '/default-avatar.png'" class="w-16 h-16 rounded-full object-cover" />
          <label class="btn-secondary cursor-pointer">
            Change photo
            <input type="file" class="hidden" accept="image/*" @change="handleAvatar" />
          </label>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input v-model="form.firstName" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input v-model="form.lastName" class="input-field" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input v-model="form.username" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea v-model="form.bio" class="input-field resize-none" rows="3" maxlength="160" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input v-model="form.website" type="url" class="input-field" placeholder="https://" />
        </div>
        <div v-if="success" class="text-green-600 text-sm">Profile updated successfully!</div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <button type="submit" :disabled="saving" class="btn-primary self-start disabled:opacity-50">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
      </form>
    </div>

    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-4">Change Password</h2>
      <form @submit.prevent="changePassword" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input v-model="pw.current" type="password" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input v-model="pw.newPw" type="password" class="input-field" minlength="8" />
        </div>
        <div v-if="pwSuccess" class="text-green-600 text-sm">Password changed successfully!</div>
        <div v-if="pwError" class="text-red-500 text-sm">{{ pwError }}</div>
        <button type="submit" :disabled="pwSaving" class="btn-primary self-start disabled:opacity-50">
          {{ pwSaving ? 'Updating...' : 'Update password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const form = ref({ firstName: '', lastName: '', username: '', bio: '', website: '', avatar: '' })
const preview = ref(null)
const avatarFile = ref(null)
const saving = ref(false)
const success = ref(false)
const error = ref('')

const pw = ref({ current: '', newPw: '' })
const pwSaving = ref(false)
const pwSuccess = ref(false)
const pwError = ref('')

onMounted(() => {
  const u = authStore.user
  if (u) form.value = { firstName: u.firstName || '', lastName: u.lastName || '', username: u.username || '', bio: u.bio || '', website: u.website || '', avatar: u.avatar || '' }
})

function handleAvatar(e) {
  avatarFile.value = e.target.files[0]
  preview.value = URL.createObjectURL(avatarFile.value)
}

async function saveProfile() {
  saving.value = true; success.value = false; error.value = ''
  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => fd.append(k, v))
    if (avatarFile.value) fd.append('avatar', avatarFile.value)
    const { data } = await api.put('/auth/profile', fd)
    authStore.user = data
    success.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  pwSaving.value = true; pwSuccess.value = false; pwError.value = ''
  try {
    await api.put('/auth/password', { currentPassword: pw.value.current, newPassword: pw.value.newPw })
    pwSuccess.value = true
    pw.value = { current: '', newPw: '' }
  } catch (e) {
    pwError.value = e.response?.data?.message || 'Failed to change password'
  } finally {
    pwSaving.value = false
  }
}
</script>
