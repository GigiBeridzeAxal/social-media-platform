<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-8xl font-bold text-primary-500">404</h1>
      <h2 class="text-2xl font-semibold text-gray-900 mt-4">Page not found</h2>
      <p class="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
      <RouterLink to="/" class="btn-primary inline-block mt-6">Go home</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
