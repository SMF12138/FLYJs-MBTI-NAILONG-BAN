<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()
let hpZeroAudio = null

onMounted(() => {
  hpZeroAudio = new Audio('/hp-zero.m4a')
  hpZeroAudio.volume = 0.8
  hpZeroAudio.play().catch(() => {})
})

onUnmounted(() => {
  if (hpZeroAudio) {
    hpZeroAudio.pause()
    hpZeroAudio.src = ''
    hpZeroAudio = null
  }
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 cursor-pointer"
    @click="store.dismissHpZero()"
  >
    <!-- 背景震动 -->
    <div class="absolute inset-0 bg-black/90 animate-shake-heavy"></div>

    <!-- 冲击效果 -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="absolute w-80 h-80 rounded-full border-4 border-cyan-400/30 animate-shockwave"></div>
      <div class="absolute w-60 h-60 rounded-full border-2 border-cyan-300/20 animate-shockwave delay-150"></div>

      <div class="text-center relative z-10">
        <!-- 龙头光晕 -->
        <div class="absolute -inset-20 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow"></div>

        <p class="text-3xl mb-6 animate-impact font-black neon-text-cyan hp-zero-text">
          我奶龙，也绝不会倒下！！！！！！！
        </p>
        <div class="text-6xl animate-bounce-slow relative z-10">🐲</div>
      </div>
    </div>

    <p class="absolute bottom-8 text-white/30 text-sm pointer-events-none animate-fade-hint">点击任意处继续</p>
  </div>
</template>

<style scoped>
@keyframes shake-heavy {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  10% { transform: translate(-8px, -5px) rotate(-1.5deg); }
  20% { transform: translate(7px, 4px) rotate(1.5deg); }
  30% { transform: translate(-6px, -3px) rotate(-1deg); }
  40% { transform: translate(5px, 3px) rotate(1deg); }
  50% { transform: translate(-3px, -2px) rotate(-0.5deg); }
  60% { transform: translate(2px, 1px) rotate(0.5deg); }
}
.animate-shake-heavy { animation: shake-heavy 0.6s ease-out; }

@keyframes shockwave {
  0% { transform: scale(0.2); opacity: 1; }
  60% { opacity: 0.6; }
  100% { transform: scale(3); opacity: 0; }
}
.animate-shockwave { animation: shockwave 1.2s ease-out forwards; }
.delay-150 { animation-delay: 0.15s; }

@keyframes impact {
  0% { transform: scale(4); opacity: 0; filter: blur(10px); }
  40% { transform: scale(0.85); opacity: 1; filter: blur(0); }
  60% { transform: scale(1.15); }
  80% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.animate-impact { animation: impact 0.8s cubic-bezier(0.22, 1, 0.36, 1); }

.hp-zero-text {
  text-shadow: 0 0 30px rgba(6,182,212,0.9), 0 0 60px rgba(6,182,212,0.5), 0 0 100px rgba(6,182,212,0.3);
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.animate-bounce-slow { animation: bounce-slow 1.5s ease-in-out infinite; }

@keyframes fade-hint {
  0%, 40% { opacity: 0; }
  100% { opacity: 1; }
}
.animate-fade-hint { animation: fade-hint 1.5s ease-out 0.8s both; }
</style>
