<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div 
      class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>
