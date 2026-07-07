<script setup>
import { useTestStore } from '../stores/test'

const store = useTestStore()

const options = [
  { id: 'A', text: '你妈' },
  { id: 'B', text: '小猫' },
  { id: 'C', text: '黑手' }
]

const handleSelect = (id) => {
  store.handleRescueEgg(false)
}

const handleHidden = () => {
  store.handleRescueEgg(true)
}
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <div class="glass-card p-8 relative glow-border">
      <div class="text-center mb-6">
        <div class="text-5xl mb-4 animate-float">❓</div>
        <h2 class="font-bold text-white text-center text-2xl gradient-text">谁救了你</h2>
      </div>
      <p class="text-gray-400 mb-8 text-center leading-relaxed text-lg">
        你从黑暗中醒来，突然灯火打开，刺得你睁不开眼，你发现你坐在最终神殿的椅子上，是谁救了你？
      </p>

      <div class="space-y-4">
        <button
          v-for="option in options"
          :key="option.id"
          @click="handleSelect(option.id)"
          class="w-full py-4 px-6 rounded-2xl text-left transition-all glass-card border-transparent hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 text-lg group"
        >
          <span class="font-medium text-gray-300 group-hover:text-white transition-colors">{{ option.text }}</span>
        </button>
      </div>

      <div
        @click="handleHidden"
        class="absolute bottom-4 right-6 text-gray-800 tracking-widest select-none cursor-default hover:text-gray-600 transition-colors text-xs"
      >王二狗</div>
    </div>
  </div>
</template>
