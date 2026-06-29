<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()
const adTexts = ref([])
const showCloseBtn = ref(true)
const elapsedSeconds = ref(0)
let textInterval = null
let countdownInterval = null

const adTextsList = [
  '广告位招租',
  '限时优惠',
  '点击领取',
  '免费试用',
  '立即下载',
  '火爆热销',
  '最后机会',
  '限量抢购'
]

const generateText = () => {
  const text = adTextsList[Math.floor(Math.random() * adTextsList.length)]
  const id = Date.now() + Math.random()
  adTexts.value.push({ id, text, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 })
  setTimeout(() => {
    adTexts.value = adTexts.value.filter(t => t.id !== id)
  }, 3000)
}

onMounted(() => {
  textInterval = setInterval(generateText, 500)

  // 计时秒数
  countdownInterval = setInterval(() => {
    elapsedSeconds.value++
    // 30秒到 -> 自动结束，不调nextQuestion（由store清理）
    if (elapsedSeconds.value >= 30) {
      store.cleanupAdTimers()
      store.showAd = false
      store.currentStage = 'normal'
      store.nextQuestion()
    }
  }, 1000)
})

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  if (countdownInterval) clearInterval(countdownInterval)
})

const handleClose = () => {
  store.handleAdCloseButton()
}
</script>

<template>
  <div class="fixed inset-0 bg-black/90 z-50 flex flex-col">
    <!-- 广告位招租大字 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <h1 class="text-4xl font-bold text-yellow-400 animate-pulse">广告位招租</h1>
    </div>
    
    <!-- 飞过的广告文字 -->
    <div 
      v-for="item in adTexts" 
      :key="item.id"
      class="absolute text-white/60 text-lg animate-ping"
      :style="{ left: item.x + '%', top: item.y + '%' }"
    >
      {{ item.text }}
    </div>
    
    <!-- 倒计时 -->
    <div class="absolute top-4 right-4 text-white/80 text-sm">
      {{ 30 - elapsedSeconds }}秒后自动关闭
    </div>
    
    <!-- 隐藏关闭按钮 - 与背景色调一致，不易发现 -->
    <button 
      v-if="showCloseBtn"
      @click="handleClose"
      class="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-white/20 hover:text-white/60 text-xs transition-opacity duration-300 opacity-20 hover:opacity-60"
      style="background: transparent; border: none; cursor: pointer;"
    >
      ✕
    </button>
    
    <!-- 提示文字（细小，在底部不易察觉） -->
    <div class="absolute bottom-4 left-0 right-0 text-center" v-if="showCloseBtn">
      <p class="text-white/10 text-xs">广告可关闭</p>
    </div>
  </div>
</template>
