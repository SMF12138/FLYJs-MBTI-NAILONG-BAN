<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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

const adAudioSources = ['/ad1.wav', '/ad2.wav', '/ad3.wav', '/ad4.wav', '/ad5.wav']
const activeAudios = []
const pendingTextTimeouts = new Set()
const adStartTimeouts = []

const onAudioEnded = (audio, eventHandler) => {
  audio.removeEventListener('ended', eventHandler)
  audio.src = ''
  const idx = activeAudios.indexOf(audio)
  if (idx !== -1) activeAudios.splice(idx, 1)
  if (elapsedSeconds.value < 30) playRandomAd()
}

const playRandomAd = () => {
  const available = adAudioSources.filter(src => !activeAudios.some(a => a.src && a.src.endsWith(src.split('/').pop())))
  if (available.length === 0) return
  const src = available[Math.floor(Math.random() * available.length)]
  const audio = new Audio(src)
  audio.volume = 0.6
  activeAudios.push(audio)
  audio.play().catch(() => {})
  const handler = () => onAudioEnded(audio, handler)
  audio.addEventListener('ended', handler)
}

const stopAllAudio = () => {
  activeAudios.forEach(a => { a.pause(); a.src = '' })
  activeAudios.length = 0
}

const generateText = () => {
  const text = adTextsList[Math.floor(Math.random() * adTextsList.length)]
  const id = Date.now() + Math.random()
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b']
  const color = colors[Math.floor(Math.random() * colors.length)]
  adTexts.value.push({ id, text, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, color })
  const tid = setTimeout(() => {
    adTexts.value = adTexts.value.filter(t => t.id !== id)
    pendingTextTimeouts.delete(tid)
  }, 3000)
  pendingTextTimeouts.add(tid)
}

onMounted(() => {
  textInterval = setInterval(generateText, 500)

  // 同时播放3个随机广告音
  for (let i = 0; i < 3; i++) {
    const tid = setTimeout(() => playRandomAd(), i * 200)
    adStartTimeouts.push(tid)
  }

  countdownInterval = setInterval(() => {
    elapsedSeconds.value++
    if (elapsedSeconds.value >= 30) {
      clearInterval(countdownInterval)
      countdownInterval = null
      stopAllAudio()
      store.handleAdEnd()
    }
  }, 1000)
})

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  if (countdownInterval) clearInterval(countdownInterval)
  adStartTimeouts.forEach(tid => clearTimeout(tid))
  adStartTimeouts.length = 0
  pendingTextTimeouts.forEach(tid => clearTimeout(tid))
  pendingTextTimeouts.clear()
  stopAllAudio()
})

const handleClose = () => {
  store.handleAdCloseButton()
}
</script>

<template>
  <div class="fixed inset-0 bg-black/95 z-50 flex flex-col">
    <!-- 网格背景 -->
    <div class="absolute inset-0 opacity-10" style="background-image: linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px); background-size: 50px 50px;"></div>
    
    <!-- 广告位招租大字 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <h1 class="text-5xl font-bold text-yellow-400 animate-pulse neon-text">广告位招租</h1>
    </div>
    
    <!-- 飞过的广告文字 -->
    <div 
      v-for="item in adTexts" 
      :key="item.id"
      class="absolute text-lg animate-ping font-bold"
      :style="{ left: item.x + '%', top: item.y + '%', color: item.color, textShadow: `0 0 10px ${item.color}` }"
    >
      {{ item.text }}
    </div>
    
    <!-- 倒计时 -->
    <div class="absolute top-4 right-4 text-white/80 text-sm glass-card px-4 py-2">
      <span class="text-cyan-400 font-bold">{{ 30 - elapsedSeconds }}</span> 秒后自动关闭
    </div>
    
    <!-- 隐藏关闭按钮 -->
    <button 
      v-if="showCloseBtn"
      @click="handleClose"
      class="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-white/20 hover:text-white/60 text-xs transition-opacity duration-300 opacity-20 hover:opacity-60"
      style="background: transparent; border: none; cursor: pointer;"
    >
      ✕
    </button>
    
    <!-- 提示文字 -->
    <div class="absolute bottom-4 left-0 right-0 text-center" v-if="showCloseBtn">
      <p class="text-white/10 text-xs">广告可关闭</p>
    </div>
  </div>
</template>
