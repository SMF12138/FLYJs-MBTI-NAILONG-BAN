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

const size = 280
const centerX = size / 2
const centerY = size / 2
const maxRadius = 100

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
    const coord = getCoord(i, 112)
    return {
      x: coord.x,
      y: coord.y,
      name: dimensionNames[i],
      value: props.scores[dim] || 0
    }
  })
})
</script>

<template>
  <div class="flex justify-center">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="max-w-full">
      <!-- 网格线 -->
      <path 
        v-for="(line, i) in gridLines" 
        :key="'grid-'+i"
        :d="line" 
        fill="none" 
        stroke="#e5e7eb" 
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
        stroke="#d1d5db" 
        stroke-width="0.5"
      />
      
      <!-- 数据多边形 -->
      <path 
        :d="dataPath" 
        fill="rgba(99, 102, 241, 0.2)" 
        stroke="#6366f1" 
        stroke-width="2"
      />
      
      <!-- 数据点 -->
      <circle 
        v-for="(dim, i) in dimensions" 
        :key="'point-'+i"
        :cx="getCoord(i, scores[dim] || 0).x"
        :cy="getCoord(i, scores[dim] || 0).y"
        r="3"
        fill="#6366f1"
      />
      
      <!-- 标签 -->
      <g v-for="(label, i) in labels" :key="'label-'+i">
        <text 
          :x="label.x" 
          :y="label.y" 
          text-anchor="middle" 
          dominant-baseline="middle"
          class="fill-gray-500"
          font-size="10"
        >
          {{ label.name }}
        </text>
        <text 
          :x="label.x" 
          :y="label.y + 11" 
          text-anchor="middle" 
          dominant-baseline="middle"
          class="fill-primary font-semibold"
          font-size="9"
        >
          {{ label.value }}
        </text>
      </g>
    </svg>
  </div>
</template>
