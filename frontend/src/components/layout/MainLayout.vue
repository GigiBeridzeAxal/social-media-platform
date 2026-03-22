<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Left Sidebar -->
    <aside class="hidden lg:flex flex-col w-64 fixed h-full border-r border-gray-200 bg-white px-4 py-6">
      <div class="flex items-center gap-2 mb-8">
        <div class="w-8 h-8 bg-primary-500 rounded-full"></div>
        <span class="text-xl font-bold text-gray-900">SocialSphere</span>
      </div>
      <nav class="flex flex-col gap-1 flex-1">
        <RouterLink v-for="item in navItems" :key="item.name" :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          :class="{ 'bg-primary-50 text-primary-600 font-semibold': $route.name === item.routeName }">
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.name }}</span>
          <span v-if="item.badge" class="ml-auto bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>
      <div class="mt-auto">
        <button @click="authStore.logout()" class="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 lg:ml-64 lg:mr-80">
      <RouterView />
    </main>

    <!-- Right Sidebar -->
    <aside class="hidden lg:block w-80 fixed right-0 h-full border-l border-gray-200 bg-white px-4 py-6 overflow-y-auto">
      <SuggestedUsers />
      <TrendingTopics class="mt-6" />
    </aside>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useNotificationsStore } from '@/store/modules/notifications'
import SuggestedUsers from '@/components/common/SuggestedUsers.vue'
import TrendingTopics from '@/components/common/TrendingTopics.vue'

const authStore = useAuthStore()
const notifStore = useNotificationsStore()

const navItems = [
  { name: 'Home', path: '/', routeName: 'home', icon: 'HomeIcon' },
  { name: 'Explore', path: '/explore', routeName: 'explore', icon: 'SearchIcon' },
  { name: 'Notifications', path: '/notifications', routeName: 'notifications', icon: 'BellIcon', badge: notifStore.unreadCount || null },
  { name: 'Messages', path: '/messages', routeName: 'messages', icon: 'MessageIcon' },
  { name: 'Profile', path: `/profile/${authStore.user?.username}`, routeName: 'profile', icon: 'UserIcon' },
  { name: 'Settings', path: '/settings', routeName: 'settings', icon: 'SettingsIcon' }
]
</script>
