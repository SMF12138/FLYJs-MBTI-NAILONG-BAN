<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
let animTimer = null

const handleSelect = (optionId) => {
  if (isAnimating.value || !store.isSpeedTimerRunning) return

  selectedOption.value = optionId
  isAnimating.value = true

  animTimer = setTimeout(() => {
    emit('answer', props.question.id, optionId)
    selectedOption.value = null
    isAnimating.value = false
    animTimer = null
  }, 400)
}

const timerColor = computed(() => {
  if (store.speedTimer <= 5) return 'text-red-500'
  if (store.speedTimer <= 10) return 'text-yellow-500'
  return 'text-cyan-400'
})

const timerGlow = computed(() => {
  if (store.speedTimer <= 5) return 'neon-text-pink'
  if (store.speedTimer <= 10) return 'neon-text'
  return 'neon-text-cyan'
})

onMounted(() => {
  store.startSpeedTimer(props.question.id)
})

onUnmounted(() => {
  if (animTimer) { clearTimeout(animTimer); animTimer = null }
})
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-6">
    <!-- 计时器 -->
    <div class="text-center mb-8">
      <div :class="['font-bold leading-none text-9xl', timerColor, timerGlow]">
        {{ store.speedTimer }}
      </div>
      <p class="text-gray-500 mt-2 text-xl">秒</p>
    </div>

    <!-- 问题 -->
    <div class="glass-card glass-card-hover p-8 mb-8">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 class="font-semibold text-white mb-3 text-2xl">
            {{ question.title }}
          </h2>
          <p class="text-gray-400 leading-relaxed text-lg">
            {{ question.question }}
          </p>
        </div>
      </div>
    </div>

    <!-- 选项 -->
    <div class="space-y-4">
      <button
        v-for="option in question.options"
        :key="option.id"
        @click="handleSelect(option.id)"
        :disabled="isAnimating || !store.isSpeedTimerRunning"
        class="w-full text-left p-6 rounded-2xl transition-all duration-200 border-2 text-lg group glass-card border-transparent hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
        :class="[
          selectedOption === option.id
            ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]'
            : '',
          (isAnimating || !store.isSpeedTimerRunning) && selectedOption !== option.id
            ? 'opacity-40'
            : ''
        ]"
      >
        <div class="flex items-start gap-4">
          <span class="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 font-bold flex items-center justify-center text-lg border border-amber-500/30 group-hover:border-amber-400 transition-colors">
            {{ option.id }}
          </span>
          <span class="text-gray-300 leading-relaxed pt-0.5 flex-1 group-hover:text-white transition-colors">
            {{ option.text }}
          </span>
        </div>
      </button>
    </div>

    <p class="text-center text-gray-500 mt-5 text-sm">
      <span class="inline-flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        超时将自动选择默认答案
      </span>
    </p>
  </div>
</template>
