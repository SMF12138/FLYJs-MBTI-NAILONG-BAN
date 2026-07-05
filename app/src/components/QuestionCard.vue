<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  questionNumber: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['answer'])

const selectedOption = ref(null)
const isAnimating = ref(false)

const handleSelect = (optionId) => {
  if (isAnimating.value) return

  selectedOption.value = optionId
  isAnimating.value = true

  setTimeout(() => {
    emit('answer', props.question.id, optionId)
    selectedOption.value = null
    isAnimating.value = false
  }, 600)
}
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <!-- 题号 -->
    <div class="text-center mb-6">
      <span class="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-full font-bold shadow-lg text-xl neon-text">
        第 {{ questionNumber }} 题
      </span>
    </div>

    <!-- 故事背景 -->
    <div class="glass-card glass-card-hover p-8 mb-8">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p class="text-gray-300 leading-relaxed text-lg">
          {{ question.story }}
        </p>
      </div>
    </div>

    <!-- 选项列表 -->
    <div class="space-y-4">
      <button
        v-for="option in question.options"
        :key="option.id"
        @click="handleSelect(option.id)"
        :disabled="isAnimating"
        class="w-full text-left p-6 rounded-2xl transition-all duration-300 border-2 text-lg group glass-card border-transparent hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
        :class="[
          selectedOption === option.id
            ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]'
            : '',
          isAnimating && selectedOption !== option.id
            ? 'opacity-40'
            : ''
        ]"
      >
        <div class="flex items-start gap-4">
          <span class="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-400 font-bold flex items-center justify-center text-lg border border-purple-500/30 group-hover:border-purple-400 transition-colors">
            {{ option.id }}
          </span>
          <span class="text-gray-300 leading-relaxed pt-0.5 flex-1 group-hover:text-white transition-colors">
            {{ option.text }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
