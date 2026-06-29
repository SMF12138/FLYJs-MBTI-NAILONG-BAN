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
  }, 500)
}
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <!-- 题号 -->
    <div class="text-center mb-6">
      <span class="inline-block px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg text-xl">
        第 {{ questionNumber }} 题
      </span>
    </div>

    <!-- 故事背景 -->
    <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
      <p class="text-gray-700 leading-relaxed text-lg">
        {{ question.story }}
      </p>
    </div>

    <!-- 选项列表 -->
    <div class="space-y-4">
      <button
        v-for="option in question.options"
        :key="option.id"
        @click="handleSelect(option.id)"
        :disabled="isAnimating"
        class="w-full text-left p-6 rounded-2xl transition-all duration-300 border-2 text-lg"
        :class="[
          selectedOption === option.id
            ? 'bg-primary/10 border-primary shadow-lg scale-[1.02]'
            : 'bg-white/95 border-transparent hover:border-primary/50 hover:shadow-md',
          isAnimating && selectedOption !== option.id
            ? 'opacity-50'
            : ''
        ]"
      >
        <div class="flex items-start gap-4">
          <span class="flex-shrink-0 w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">
            {{ option.id }}
          </span>
          <span class="text-gray-700 leading-relaxed pt-0.5 flex-1">
            {{ option.text }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
