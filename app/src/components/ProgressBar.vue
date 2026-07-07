<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
    <div 
      class="h-full progress-bar-glow transition-all duration-700 ease-out rounded-full relative"
      :style="{ width: `${progress}%` }"
    >
      <!-- 光效 -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
      <!-- 头部光点 -->
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-purple-500/50"></div>
    </div>
  </div>
</template>
