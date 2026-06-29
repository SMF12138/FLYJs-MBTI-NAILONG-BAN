<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTestStore } from '../stores/test'

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['answer'])

const store = useTestStore()
const selectedOption = ref(null)
const isAnimating = ref(false)

const handleSelect = (optionId) => {
  if (isAnimating.value || !store.isSpeedTimerRunning) return

  selectedOption.value = optionId
  isAnimating.value = true

  setTimeout(() => {
    emit('answer', props.question.id, optionId)
    selectedOption.value = null
    isAnimating.value = false
  }, 300)
}

const timerColor = computed(() => {
  if (store.speedTimer <= 5) return 'text-red-500'
  if (store.speedTimer <= 10) return 'text-yellow-500'
  return 'text-primary'
})

onMounted(() => {
  store.startSpeedTimer(props.question.id)
})
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <!-- 计时器 -->
    <div class="text-center mb-8">
      <div :class="['font-bold leading-none text-8xl', timerColor]">
        {{ store.speedTimer }}
      </div>
      <p class="text-gray-400 mt-2 text-xl">秒</p>
    </div>

    <!-- 问题 -->
    <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
      <h2 class="font-semibold text-gray-800 mb-3 text-2xl">
        {{ question.title }}
      </h2>
      <p class="text-gray-600 leading-relaxed text-lg">
        {{ question.question }}
      </p>
    </div>

    <!-- 选项 -->
    <div class="space-y-4">
      <button
        v-for="option in question.options"
        :key="option.id"
        @click="handleSelect(option.id)"
        :disabled="isAnimating || !store.isSpeedTimerRunning"
        class="w-full text-left p-6 rounded-2xl transition-all duration-200 border-2 text-lg"
        :class="[
          selectedOption === option.id
            ? 'bg-primary/10 border-primary shadow-lg scale-[1.02]'
            : 'bg-white/95 border-transparent hover:border-primary/50 hover:shadow-md',
          (isAnimating || !store.isSpeedTimerRunning) && selectedOption !== option.id
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

    <p class="text-center text-gray-400 mt-5 text-sm">
      超时将自动选择默认答案
    </p>
  </div>
</template>
