<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()
let audio = null

onMounted(() => {
  audio = new Audio('/q18-woainailong.wav')
  audio.currentTime = 0
  audio.play().catch(() => {})
})

onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
})

const options = [
  { id: 'A', text: '奶聋' },
  { id: 'B', text: '小猫' },
  { id: 'C', text: '尔伯' },
  { id: 'D', text: '奶虫' },
  { id: 'hidden', text: '奶龙', isHidden: true }
]

const handleSelect = (id) => {
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
  if (id === 'hidden') {
    store.handleNameEgg(true)
  } else {
    store.handleNameEgg(false)
  }
}
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <div class="glass-card p-8 glow-border">
      <div class="text-center mb-6">
        <div class="text-5xl mb-4 animate-float">📝</div>
        <h2 class="font-bold text-white text-center text-2xl gradient-text">还记得自己的名字吗</h2>
      </div>
      <p class="text-gray-400 mb-8 text-center leading-relaxed text-lg">
        作者感受到了你的情绪波动，此时作者要向你提一个简单的问题，只要你能回答对，就会奖励你一个大宝贝，这个问题就是，你还记得自己的名字吗
      </p>

      <div class="space-y-4">
        <button
          v-for="option in options"
          :key="option.id"
          @click="handleSelect(option.id)"
          class="w-full py-4 px-6 rounded-2xl text-left transition-all text-lg group"
          :class="[
            option.isHidden 
              ? 'text-gray-700 hover:text-gray-500 cursor-pointer bg-transparent border border-transparent hover:border-gray-700' 
              : 'glass-card border-transparent hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10'
          ]"
        >
          <span class="font-medium" :class="option.isHidden ? 'text-gray-800' : 'text-gray-300 group-hover:text-white transition-colors'">{{ option.text }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
