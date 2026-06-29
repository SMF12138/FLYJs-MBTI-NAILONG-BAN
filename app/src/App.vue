<script setup>
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
import ProgressBar from './components/ProgressBar.vue'

const store = useTestStore()

const handleAnswer = (questionId, optionId) => {
  store.answerQuestion(questionId, optionId)
}

const handleSpeedAnswer = (questionId, optionId) => {
  store.answerSpeedQuestion(questionId, optionId)
}

const stageLabel = (stage) => {
  const map = {
    normal: null,
    speed: null,
    invitation: '邀请函',
    nameEgg: '彩蛋：记忆考验',
    poemEgg: '彩蛋：谜题诗',
    rescueEgg: '彩蛋：谁救了你',
    '1yuan': '隐藏题',
  }
  return map[stage] ?? ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 开始界面 -->
    <StartScreen v-if="store.currentStage === 'start'" />

    <!-- 结果界面 -->
    <ResultScreen v-else-if="store.currentStage === 'result'" />

    <!-- 答题界面 -->
    <div v-else class="flex-1 flex flex-col">
      <!-- 顶部状态栏 -->
      <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div class="w-[1510px] max-w-[95%] mx-auto px-8 py-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500 font-medium" v-if="store.currentStage === 'normal'">
              第 {{ store.currentQuestionIndex + 1 }} / {{ store.totalQuestions }} 题
            </span>
            <span class="text-sm text-gray-500 font-medium" v-else-if="store.currentStage === 'speed'">
              速答 {{ store.currentSpeedIndex + 1 }} / {{ store.speedQs.length }}
            </span>
            <span class="text-sm text-gray-500 font-medium" v-else-if="stageLabel(store.currentStage)">
              {{ stageLabel(store.currentStage) }}
            </span>
            <HpBar />
          </div>
          <ProgressBar v-if="store.currentStage === 'normal'" :progress="store.progress" />
        </div>
      </div>

      <!-- 正常题目 -->
      <div v-if="store.currentStage === 'normal'" class="flex-1 flex items-start justify-center py-6 sm:py-8">
        <QuestionCard
          v-if="store.currentQuestion"
          :question="store.currentQuestion"
          :questionNumber="store.currentQuestionIndex + 1"
          @answer="handleAnswer"
        />
      </div>

      <!-- 邀请函 -->
      <div v-else-if="store.currentStage === 'invitation'" class="flex-1 flex items-start justify-center py-6 sm:py-8">
        <InvitationTest />
      </div>

      <!-- 记得名字彩蛋 -->
      <div v-else-if="store.currentStage === 'nameEgg'" class="flex-1 flex items-start justify-center py-6 sm:py-8">
        <NameEgg />
      </div>

      <!-- 谜题诗 -->
      <div v-else-if="store.currentStage === 'poemEgg'" class="flex-1 flex items-start justify-center py-6 sm:py-8">
        <PoemEgg />
      </div>

      <!-- 谁救了你 -->
      <div v-else-if="store.currentStage === 'rescueEgg'" class="flex-1 flex items-start justify-center py-6 sm:py-8">
        <RescueEgg />
      </div>

      <!-- 1元测试 (modal overlay, not in container) -->
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
      <div
        v-if="store.showHpLoss && !store.showHpZeroEffect"
        class="fixed inset-0 bg-black/40 flex flex-col items-center justify-center z-50 cursor-pointer animate-shake"
        @click="store.dismissHpLoss()"
      >
        <div class="text-5xl font-bold text-red-500 animate-pulse mb-3 drop-shadow-lg">
          -1 HP
        </div>
        <div class="text-lg text-red-300 animate-bounce drop-shadow-md">
          {{ store.hpLossMessage }}
        </div>
        <p class="text-white/40 text-sm mt-6">点击任意处继续</p>
      </div>
    </Transition>

    <!-- 血量清零特效 -->
    <Transition name="fade">
      <div
        v-if="store.showHpZeroEffect"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
        @click="store.dismissHpZero()"
      >
        <div class="text-center text-white px-6">
          <p class="text-xl mb-4 animate-pulse">我奶龙，也绝不能倒下！！！！！！！</p>
          <div class="text-4xl animate-bounce">🐲</div>
          <p class="text-white/40 text-sm mt-6">点击任意处继续</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
