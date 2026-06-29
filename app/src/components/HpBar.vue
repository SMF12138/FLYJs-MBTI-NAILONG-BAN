<script setup>
import { useTestStore } from '../stores/test'

const store = useTestStore()
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span class="text-xs text-gray-400 font-medium">HP</span>
    <div class="flex gap-1">
      <div 
        v-for="i in store.maxHp" 
        :key="i"
        :class="[
          'w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-300',
          i <= store.hp 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-200 text-gray-400'
        ]"
      >
        {{ i <= store.hp ? '❤️' : '🖤' }}
      </div>
    </div>
  </div>
</template>
