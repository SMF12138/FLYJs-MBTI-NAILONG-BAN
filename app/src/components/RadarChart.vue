<script setup>
import { computed } from 'vue'

const props = defineProps({
  scores: {
    type: Object,
    required: true
  }
})

const dimensions = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15']
const dimensionNames = ['洞察', '寡合', '谋断', '悲欢', '创造', '荣辱', '恻隐', '信疑', '是非', '羞恶', '勇懦', '恒变', '逍遥', '贪舍', '幽默']

const size = 320
const centerX = size / 2
const centerY = size / 2
const maxRadius = 110

const getAngle = (index) => {
  return (Math.PI * 2 * index) / dimensions.length - Math.PI / 2
}

const getCoord = (index, value) => {
  const angle = getAngle(index)
  const radius = (value / 100) * maxRadius
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  }
}

const dataPath = computed(() => {
  const points = dimensions.map((dim, i) => {
    const coord = getCoord(i, props.scores[dim] || 0)
    return `${coord.x},${coord.y}`
  })
  return `M${points.join('L')}Z`
})

const gridLines = computed(() => {
  const lines = []
  for (let level = 20; level <= 100; level += 20) {
    const points = dimensions.map((_, i) => {
      const coord = getCoord(i, level)
      return `${coord.x},${coord.y}`
    })
    lines.push(`M${points.join('L')}Z`)
  }
  return lines
})

const axisLines = computed(() => {
  return dimensions.map((_, i) => {
    const end = getCoord(i, 100)
    return { x1: centerX, y1: centerY, x2: end.x, y2: end.y }
  })
})

const labels = computed(() => {
  return dimensions.map((dim, i) => {
    const coord = getCoord(i, 125)
    return {
      x: coord.x,
      y: coord.y,
      name: dimensionNames[i],
      value: props.scores[dim] || 0
    }
  })
})

// 霓虹色彩
const neonColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899',
  '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'
]
</script>

<template>
  <div class="flex justify-center">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="max-w-full">
      <!-- 发光背景 -->
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(99, 102, 241, 0.1)" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
        <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="50%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#ec4899" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 背景光晕 -->
      <circle :cx="centerX" :cy="centerY" :r="maxRadius + 20" fill="url(#radarGlow)" />
      
      <!-- 网格线 -->
      <path 
        v-for="(line, i) in gridLines" 
        :key="'grid-'+i"
        :d="line" 
        fill="none" 
        stroke="rgba(99, 102, 241, 0.15)" 
        stroke-width="1"
      />
      
      <!-- 轴线 -->
      <line 
        v-for="(axis, i) in axisLines" 
        :key="'axis-'+i"
        :x1="axis.x1" 
        :y1="axis.y1" 
        :x2="axis.x2" 
        :y2="axis.y2" 
        stroke="rgba(99, 102, 241, 0.2)" 
        stroke-width="0.5"
      />
      
      <!-- 数据多边形 -->
      <path 
        :d="dataPath" 
        fill="url(#dataGradient)" 
        fill-opacity="0.25"
        stroke="url(#dataGradient)" 
        stroke-width="2"
        filter="url(#glow)"
      />
      
      <!-- 数据点 -->
      <circle 
        v-for="(dim, i) in dimensions" 
        :key="'point-'+i"
        :cx="getCoord(i, scores[dim] || 0).x"
        :cy="getCoord(i, scores[dim] || 0).y"
        r="4"
        :fill="neonColors[i]"
        filter="url(#glow)"
      />
      
      <!-- 标签 -->
      <g v-for="(label, i) in labels" :key="'label-'+i">
        <text 
          :x="label.x" 
          :y="label.y - 6" 
          text-anchor="middle" 
          dominant-baseline="middle"
          fill="#94a3b8"
          font-size="11"
          font-weight="500"
        >
          {{ label.name }}
        </text>
        <text 
          :x="label.x" 
          :y="label.y + 8" 
          text-anchor="middle" 
          dominant-baseline="middle"
          :fill="neonColors[i]"
          font-size="10"
          font-weight="bold"
        >
          {{ label.value }}
        </text>
      </g>
    </svg>
  </div>
</template>
