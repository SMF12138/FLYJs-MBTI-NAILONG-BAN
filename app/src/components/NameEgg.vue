<script setup>
import { useTestStore } from '../stores/test'

const store = useTestStore()

const options = [
  { id: 'A', text: '奶聋' },
  { id: 'B', text: '小猫' },
  { id: 'C', text: '尔伯' },
  { id: 'D', text: '奶虫' },
  { id: 'hidden', text: '奶龙', isHidden: true }
]

const handleSelect = (id) => {
  if (id === 'hidden') {
    store.handleNameEgg(true)
  } else {
    store.handleNameEgg(false)
  }
}
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <h2 class="font-bold text-gray-800 mb-5 text-center text-2xl">📝 还记得自己的名字吗</h2>
      <p class="text-gray-600 mb-8 text-center leading-relaxed text-lg">
        作者感受到了你的情绪波动，此时作者要向你提一个简单的问题，只要你能回答对，就会奖励你一个大宝贝，这个问题就是，你还记得自己的名字吗
      </p>

      <div class="space-y-4">
        <button
          v-for="option in options"
          :key="option.id"
          @click="handleSelect(option.id)"
          class="w-full py-4 px-6 rounded-2xl text-left transition-all bg-gray-50 border-2 border-transparent hover:border-gray-200 text-lg"
          :class="{ 'text-gray-200 hover:text-gray-400 cursor-pointer': option.isHidden }"
        >
          <span class="font-medium" :class="option.isHidden ? 'text-gray-200' : 'text-gray-700'">{{ option.text }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
