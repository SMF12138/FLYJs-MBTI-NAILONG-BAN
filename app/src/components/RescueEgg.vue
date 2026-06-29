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
    <div class="bg-white rounded-2xl shadow-xl p-8 relative">
      <h2 class="font-bold text-gray-800 mb-5 text-center text-2xl">❓ 谁救了你</h2>
      <p class="text-gray-600 mb-8 text-center leading-relaxed text-lg">
        你从黑暗中醒来，突然灯火打开，刺得你睁不开眼，你发现你坐在最终神殿的椅子上，是谁救了你？
      </p>

      <div class="space-y-4">
        <button
          v-for="option in options"
          :key="option.id"
          @click="handleSelect(option.id)"
          class="w-full py-4 px-6 rounded-2xl text-left transition-all bg-gray-50 border-2 border-transparent hover:border-gray-200 text-lg"
        >
          <span class="font-medium text-gray-700">{{ option.text }}</span>
        </button>
      </div>

      <div
        @click="handleHidden"
        class="absolute bottom-4 right-6 text-gray-200 tracking-widest select-none cursor-default hover:text-gray-400 transition-colors text-xs"
      >王二狗</div>
    </div>
  </div>
</template>
