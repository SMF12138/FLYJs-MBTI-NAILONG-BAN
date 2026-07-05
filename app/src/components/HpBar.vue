<script setup>
import { computed } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()

const hpPercent = computed(() => (store.hp / store.maxHp) * 100)

const barColor = computed(() => {
  if (store.hp >= 3) return { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.6)' }
  if (store.hp === 2) return { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.6)' }
  return { from: '#ef4444', to: '#f87171', glow: 'rgba(239,68,68,0.6)' }
})
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="text-xs text-gray-400 font-bold tracking-widest uppercase">HP</span>

    <!-- 血条容器 -->
    <div class="relative w-48 h-5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
      <!-- 背景光效 -->
      <div class="absolute inset-0 rounded-full opacity-30"
        :style="{ background: `linear-gradient(90deg, ${barColor.from}, ${barColor.to})` }">
      </div>

      <!-- 血量填充 -->
      <div
        class="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
        :style="{
          width: hpPercent + '%',
          background: `linear-gradient(90deg, ${barColor.from}, ${barColor.to})`,
          boxShadow: `0 0 12px ${barColor.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`
        }"
      >
        <!-- 流光效果 -->
        <div class="absolute inset-0 rounded-full overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <!-- 边框高光 -->
      <div class="absolute inset-0 rounded-full border border-white/10"></div>
    </div>

    <!-- HP 数字 -->
    <span
      class="font-bold text-sm tabular-nums transition-colors duration-300"
      :style="{ color: barColor.from }"
    >
      {{ store.hp }}/{{ store.maxHp }}
    </span>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
</style>
