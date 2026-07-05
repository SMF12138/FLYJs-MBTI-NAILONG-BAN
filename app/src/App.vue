<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTestStore } from './stores/test'
import StartScreen from './components/StartScreen.vue'
import QuestionCard from './components/QuestionCard.vue'
import SpeedQuestion from './components/SpeedQuestion.vue'
import OneYuanTest from './components/OneYuanTest.vue'
import InvitationTest from './components/InvitationTest.vue'
import NameEgg from './components/NameEgg.vue'
import PoemEgg from './components/PoemEgg.vue'
import RescueEgg from './components/RescueEgg.vue'
import AdOverlay from './components/AdOverlay.vue'
import ResultScreen from './components/ResultScreen.vue'
import HpBar from './components/HpBar.vue'
import HpLossOverlay from './components/HpLossOverlay.vue'
import HpZeroOverlay from './components/HpZeroOverlay.vue'
import ProgressBar from './components/ProgressBar.vue'

const store = useTestStore()
const showInfo = ref(false)
const particles = ref([])
let particleInterval = null
const MAX_PARTICLES = 30
const pendingTimeouts = new Set()

// 全局按钮点击音效
let audioCtx = null
const playClick = () => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.08)
  } catch (e) {}
}

const handleGlobalClick = (e) => {
  const btn = e.target.closest('button, [role="button"], .btn-primary, .glass-card-hover')
  if (btn) playClick()
}

const handleAnswer = (questionId, optionId) => {
  store.answerQuestion(questionId, optionId)
}

const handleSpeedAnswer = (questionId, optionId) => {
  store.answerSpeedQuestion(questionId, optionId)
}

const stageLabel = (stage) => {
  const map = {
    invitation: '邀请函',
    nameEgg: '彩蛋：记忆考验',
    poemEgg: '彩蛋：谜题诗',
    rescueEgg: '彩蛋：谁救了你',
    '1yuan': '隐藏题',
  }
  return map[stage] ?? ''
}

const stageComponents = {
  invitation: InvitationTest,
  nameEgg: NameEgg,
  poemEgg: PoemEgg,
  rescueEgg: RescueEgg,
}

// 粒子效果
const createParticle = () => {
  if (particles.value.length >= MAX_PARTICLES) return
  const id = Date.now() + Math.random()
  const x = Math.random() * 100
  const size = Math.random() * 3 + 1
  const duration = Math.random() * 3 + 2
  const delay = Math.random() * 2
  const opacity = Math.random() * 0.5 + 0.2

  particles.value.push({ id, x, size, duration, delay, opacity })

  const tid = setTimeout(() => {
    particles.value = particles.value.filter(p => p.id !== id)
    pendingTimeouts.delete(tid)
  }, (duration + delay) * 1000)
  pendingTimeouts.add(tid)
}

onMounted(() => {
  particleInterval = setInterval(createParticle, 300)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  if (particleInterval) clearInterval(particleInterval)
  pendingTimeouts.forEach(tid => clearTimeout(tid))
  pendingTimeouts.clear()
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('click', handleGlobalClick)
})

// 测试者特权：↑↓切换题目
const handleKeydown = (e) => {
  if (store.currentStage !== 'normal') return
  if (store.showHpLoss || store.showHpZeroEffect) return
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (store.currentQuestionIndex > 0) {
      store.currentQuestionIndex--
      store.handleKeyNav()
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (store.currentQuestionIndex < store.questions.length - 1) {
      store.currentQuestionIndex++
      store.handleKeyNav()
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col relative">
    <!-- 星空背景 -->
    <div class="starfield"></div>
    
    <!-- 浮动粒子 -->
    <div class="particle-canvas">
      <div
        v-for="p in particles"
        :key="p.id"
        class="particle"
        :style="{
          left: p.x + '%',
          bottom: '0',
          width: p.size + 'px',
          height: p.size + 'px',
          animationDuration: p.duration + 's',
          animationDelay: p.delay + 's',
          opacity: p.opacity,
          animation: `particle-float ${p.duration}s ease-out ${p.delay}s forwards`
        }"
      />
    </div>

    <!-- 扫描线效果 -->
    <div class="scanline"></div>

    <!-- 内容层 -->
    <div class="content-layer">
      <!-- 开始界面 -->
      <StartScreen v-if="store.currentStage === 'start'" />

      <!-- 结果界面 -->
      <ResultScreen v-else-if="store.currentStage === 'result'" />

      <!-- 答题界面（特效时隐藏） -->
      <div v-else-if="!store.showHpLoss && !store.showHpZeroEffect" class="flex-1 flex flex-col">
        <!-- 顶部状态栏 -->
        <div class="sticky top-0 z-10 glass-card border-b-0 rounded-none" style="border-bottom: 1px solid var(--border-glass);">
          <div class="w-[755px] max-w-[95%] mx-auto px-8 py-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium" :class="store.currentStage === 'normal' ? 'text-cyan-400' : 'text-purple-400'" v-if="store.currentStage === 'normal'">
                <span class="neon-text-cyan">第 {{ store.currentQuestionIndex + 1 }} / {{ store.totalQuestions }} 题</span>
              </span>
              <span class="text-sm font-medium text-amber-400" v-else-if="store.currentStage === 'speed'">
                <span class="neon-text">⚡ 速答 {{ store.currentSpeedIndex + 1 }} / {{ store.speedQs.length }}</span>
              </span>
              <span class="text-sm font-medium text-purple-400" v-else-if="stageLabel(store.currentStage)">
                {{ stageLabel(store.currentStage) }}
              </span>
              <HpBar />
            </div>
            <ProgressBar v-if="store.currentStage === 'normal'" :progress="store.progress" />
          </div>
        </div>

        <!-- 简单阶段：动态组件 -->
        <component
          v-if="stageComponents[store.currentStage]"
          :is="stageComponents[store.currentStage]"
          class="flex-1"
        />

        <!-- 正常题目 -->
        <div v-if="store.currentStage === 'normal'" class="flex-1 flex items-start justify-center py-6 sm:py-8">
          <QuestionCard
            v-if="store.currentQuestion"
            :question="store.currentQuestion"
            :questionNumber="store.currentQuestionIndex + 1"
            @answer="handleAnswer"
          />
        </div>

        <!-- 1元测试 (modal overlay) -->
        <OneYuanTest v-if="store.currentStage === '1yuan'" />

        <!-- 速答环节 -->
        <div v-else-if="store.currentStage === 'speed'" class="flex-1 flex items-start justify-center py-6 sm:py-8">
          <SpeedQuestion
            v-if="store.currentSpeedQuestion"
            :question="store.currentSpeedQuestion"
            @answer="handleSpeedAnswer"
          />
        </div>
      </div>

      <!-- 广告覆盖层 -->
      <AdOverlay v-if="store.showAd" />

      <!-- 血量扣减动画 -->
      <Transition name="fade">
        <HpLossOverlay v-if="store.showHpLoss && !store.showHpZeroEffect" />
      </Transition>

      <!-- 血量清零特效 -->
      <Transition name="fade">
        <HpZeroOverlay v-if="store.showHpZeroEffect" />
      </Transition>
    </div>

    <!-- 关于按钮 -->
    <button
      @click="showInfo = true"
      class="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-110 transition-all duration-300 cursor-pointer"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>

    <!-- 信息弹窗 -->
    <Transition name="fade">
      <div v-if="showInfo" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showInfo = false">
        <div class="glass-card p-8 sm:p-10 max-w-lg w-full mx-4 animate-fade-in">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white gradient-text">关于项目</h3>
            <button @click="showInfo = false" class="text-gray-400 hover:text-white text-2xl transition-colors">&times;</button>
          </div>
          <div class="space-y-4 text-gray-300 text-lg leading-relaxed">
            <p>本项目处于<span class="text-purple-400 font-semibold">测试阶段</span>，其中很多设计由作者在<span class="text-cyan-400 font-semibold">睡梦中</span>完成。</p>
            <p>有任何意见和好的优化可以通过邮箱联系我们的策划哦！</p>
            <div class="glass-card p-4 border-l-4 border-cyan-500">
              <p class="text-cyan-400 font-semibold text-xl">📧 flyjssmf@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
