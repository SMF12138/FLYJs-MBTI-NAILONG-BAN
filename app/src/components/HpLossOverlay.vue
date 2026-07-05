<script setup>
import { useTestStore } from '../stores/test'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const store = useTestStore()
const phase = ref(0)
const hpPercent = computed(() => (store.hp / store.maxHp) * 100)

const timers = []

onMounted(() => {
  timers.push(setTimeout(() => { phase.value = 1 }, 400))
  timers.push(setTimeout(() => { phase.value = 2 }, 2000))
  timers.push(setTimeout(() => { phase.value = 3 }, 3600))
})

onUnmounted(() => {
  timers.forEach(id => clearTimeout(id))
  timers.length = 0
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 cursor-pointer overflow-hidden"
    @click="store.dismissHpLoss()"
  >
    <!-- 红色闪光 -->
    <div class="absolute inset-0 bg-red-600/0 animate-red-flash"></div>
    <!-- 背景震动 -->
    <div class="absolute inset-0 bg-black/80 animate-shake-heavy"></div>

    <!-- 冲击波圈 -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="absolute w-48 h-48 rounded-full border-4 border-red-500/50 animate-ring"></div>
      <div class="absolute w-48 h-48 rounded-full border-2 border-orange-400/30 animate-ring" style="animation-delay:0.15s"></div>
      <div class="absolute w-48 h-48 rounded-full border border-yellow-300/20 animate-ring" style="animation-delay:0.3s"></div>
    </div>

    <!-- 中心区域 -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

      <!-- 血条（出现→碎裂消散） -->
      <div v-if="phase >= 1 && phase < 2" class="absolute">
        <div class="relative w-80 mx-auto">
          <div class="h-5 bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative animate-bar-in">
            <div class="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-full"></div>
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 to-red-400"
              :style="{ width: hpPercent + '%', boxShadow: '0 0 12px rgba(239,68,68,0.6)' }"
            ></div>
            <div class="absolute inset-0 rounded-full border border-white/10"></div>
          </div>
          <!-- 碎裂颗粒 -->
          <div class="absolute inset-0 pointer-events-none">
            <div v-for="i in 24" :key="i"
              class="absolute rounded-sm animate-bar-shard"
              :style="{
                left: (Math.random() * 90 + 5) + '%',
                top: '30%',
                width: (4 + Math.random() * 8) + 'px',
                height: (3 + Math.random() * 4) + 'px',
                background: ['#ef4444', '#dc2626', '#f97316', '#fbbf24', '#e11d48'][i % 5],
                boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                '--tx': (Math.random() - 0.5) * 400 + 'px',
                '--ty': (-30 - Math.random() * 120) + 'px',
                '--rot': (Math.random() * 360) + 'deg',
                animationDelay: (Math.random() * 0.15) + 's'
              }"
            ></div>
          </div>
        </div>
        <p class="text-red-400/60 text-sm mt-3 font-mono text-center">
          HP {{ store.hp }} / {{ store.maxHp }}
        </p>
      </div>

      <!-- 光波扩散 -->
      <div v-if="phase >= 2" class="absolute pointer-events-none">
        <div class="absolute w-4 h-4 rounded-full bg-red-500/80 animate-wave-burst" style="top:50%;left:50%;transform:translate(-50%,-50%);"></div>
        <div class="absolute w-4 h-4 rounded-full border-2 border-red-400/60 animate-wave-ring" style="top:50%;left:50%;transform:translate(-50%,-50%);"></div>
        <div class="absolute w-4 h-4 rounded-full border border-orange-300/40 animate-wave-ring" style="top:50%;left:50%;transform:translate(-50%,-50%);animation-delay:0.15s;"></div>
      </div>

      <!-- 文字放大发光 -->
      <div v-if="phase >= 3" class="absolute text-center">
        <p class="text-3xl font-black text-red-300 animate-text-burst"
          style="text-shadow: 0 0 20px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.3), 0 0 100px rgba(239,68,68,0.15);">
          {{ store.hpLossMessage }}
        </p>
        <p class="text-sm text-red-400/50 mt-4 font-mono animate-fade-sub">
          HP {{ store.hp }} / {{ store.maxHp }}
        </p>
      </div>
    </div>

    <!-- 血溅粒子 -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div v-for="i in 20" :key="i"
        class="absolute rounded-full animate-blood"
        :style="{
          left: (46 + Math.random() * 8) + '%',
          top: (46 + Math.random() * 8) + '%',
          width: (2 + Math.random() * 4) + 'px',
          height: (2 + Math.random() * 4) + 'px',
          background: 'radial-gradient(circle, #ef4444 30%, #991b1b)',
          '--tx': (Math.random() - 0.5) * 500 + 'px',
          '--ty': (Math.random() - 0.3) * 400 + 'px',
          animationDelay: (Math.random() * 0.2) + 's'
        }"
      ></div>
    </div>

    <!-- 屏幕裂纹 -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none animate-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="50" y1="50" x2="25" y2="5" stroke="rgba(255,255,255,0.15)" stroke-width="0.2" />
      <line x1="50" y1="50" x2="82" y2="10" stroke="rgba(255,255,255,0.12)" stroke-width="0.15" />
      <line x1="50" y1="50" x2="95" y2="45" stroke="rgba(255,255,255,0.1)" stroke-width="0.15" />
      <line x1="50" y1="50" x2="8" y2="65" stroke="rgba(255,255,255,0.1)" stroke-width="0.15" />
      <line x1="50" y1="50" x2="65" y2="95" stroke="rgba(255,255,255,0.08)" stroke-width="0.15" />
    </svg>

    <p class="absolute bottom-8 text-white/30 text-sm pointer-events-none animate-fade-hint">点击任意处继续</p>
  </div>
</template>

<style scoped>
@keyframes red-flash {
  0% { background-color: rgba(220,38,38,0.6); }
  100% { background-color: rgba(220,38,38,0); }
}
.animate-red-flash { animation: red-flash 1s ease-out forwards; }

@keyframes shake-heavy {
  0%,100% { transform: translate(0,0) rotate(0); }
  10% { transform: translate(-10px,-6px) rotate(-2deg); }
  20% { transform: translate(9px,5px) rotate(2deg); }
  30% { transform: translate(-7px,-4px) rotate(-1.5deg); }
  40% { transform: translate(5px,3px) rotate(1deg); }
  50% { transform: translate(-3px,-2px); }
}
.animate-shake-heavy { animation: shake-heavy 1s ease-out; }

@keyframes ring {
  0% { transform: scale(0.3); opacity: 1; }
  100% { transform: scale(5); opacity: 0; }
}
.animate-ring { animation: ring 1.6s ease-out forwards; }

/* 血条入场 */
@keyframes bar-in {
  0% { transform: scaleX(0); opacity: 0; }
  100% { transform: scaleX(1); opacity: 1; }
}
.animate-bar-in { transform-origin: left; animation: bar-in 0.8s ease-out forwards; }

/* 血条碎裂颗粒飞散 */
@keyframes bar-shard {
  0% { transform: translate(0,0) rotate(0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.2); opacity: 0; }
}
.animate-bar-shard { animation: bar-shard 1.2s ease-out forwards; }

/* 光波爆发 */
@keyframes wave-burst {
  0% { transform: translate(-50%,-50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(8); opacity: 0; }
}
.animate-wave-burst { animation: wave-burst 1.6s ease-out forwards; }

@keyframes wave-ring {
  0% { transform: translate(-50%,-50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(12); opacity: 0; }
}
.animate-wave-ring { animation: wave-ring 2s ease-out forwards; }

/* 文字放大发光（×5慢） */
@keyframes text-burst {
  0% { transform: scale(0.3); opacity: 0; filter: blur(12px); }
  30% { transform: scale(1.4); opacity: 1; filter: blur(0); text-shadow: 0 0 60px rgba(239,68,68,1), 0 0 120px rgba(239,68,68,0.6); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.animate-text-burst { animation: text-burst 4s cubic-bezier(0.22,1,0.36,1) forwards; }

@keyframes fade-sub {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-sub { animation: fade-sub 2s ease-out 1.5s both; }

@keyframes blood {
  0% { transform: translate(0,0) scale(0.3); opacity: 0.9; }
  100% { transform: translate(var(--tx), var(--ty)) scale(1.2); opacity: 0; }
}
.animate-blood { animation: blood 1s ease-out 0.1s forwards; opacity: 0; }

@keyframes cracks {
  0% { opacity: 0; }
  30% { opacity: 0.8; }
  100% { opacity: 0.15; }
}
.animate-cracks { animation: cracks 1.6s ease-out 0.2s both; }

@keyframes fade-hint {
  0%,60% { opacity: 0; }
  100% { opacity: 1; }
}
.animate-fade-hint { animation: fade-hint 4s ease-out 5s both; }
</style>
