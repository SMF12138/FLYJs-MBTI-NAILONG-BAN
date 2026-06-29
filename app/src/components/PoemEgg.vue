<script setup>
import { ref, computed } from 'vue'
import { useTestStore } from '../stores/test'

const store = useTestStore()

const poem = [
  '内景蛰伏造乾坤',
  '一朝悟道命此身',
  '吾心本是方寸主',
  '天外来魔欲夺魂',
  '枪淋只为红尘客',
  '弹雨还需知己存',
  '乘有此机脱桎梏',
  '翻江覆海亦为尊'
]

const COLORS = [
  { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
  { bg: '#fff7ed', border: '#fdba74', text: '#ea580c' },
  { bg: '#fefce8', border: '#fde047', text: '#ca8a04' },
  { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  { bg: '#ecfeff', border: '#67e8f9', text: '#0891b2' },
  { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb' },
  { bg: '#faf5ff', border: '#d8b4fe', text: '#9333ea' }
]

const grid = ref([])
const pool = ref([])
const solved = ref(false)
const wrongFlash = ref(null)
const dragChar = ref(null)
const dragFrom = ref(null)
const glowPhase = ref(-1)
const glowLine = ref(-1)

const correctAnswer = poem.join('')

const allFilled = computed(() => {
  return grid.value.every(line => line.every(slot => slot.char !== null))
})

const initPuzzle = () => {
  const allChars = poem.join('').split('')
  const shuffled = allChars.sort(() => Math.random() - 0.5)

  grid.value = poem.map(line =>
    line.split('').map(() => ({ char: null, correctLine: -1, correctSlot: -1 }))
  )

  const charPositions = []
  poem.forEach((line, l) => {
    line.split('').forEach((ch, s) => {
      charPositions.push({ char: ch, line: l, slot: s })
    })
  })

  pool.value = shuffled.map((char, i) => {
    const pos = charPositions.find(p => p.char === char && !p.used)
    if (pos) pos.used = true
    return {
      id: i,
      char,
      correctLine: pos ? pos.line : -1,
      correctSlot: pos ? pos.slot : -1
    }
  })
}

initPuzzle()

const onDragStartPool = (e, idx) => {
  dragChar.value = { char: pool.value[idx].char, correctLine: pool.value[idx].correctLine, correctSlot: pool.value[idx].correctSlot }
  dragFrom.value = { type: 'pool', idx }
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', pool.value[idx].char)
}

const onDragStartSlot = (e, lineIdx, slotIdx) => {
  const slot = grid.value[lineIdx][slotIdx]
  if (!slot.char) return
  dragChar.value = { char: slot.char, correctLine: slot.correctLine, correctSlot: slot.correctSlot }
  dragFrom.value = { type: 'slot', lineIdx, slotIdx }
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', slot.char)
}

const onDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const onDropToSlot = (e, lineIdx, slotIdx) => {
  e.preventDefault()
  if (!dragChar.value) return

  const slot = grid.value[lineIdx][slotIdx]

  if (dragFrom.value.type === 'pool') {
    if (slot.char !== null) {
      pool.value.push({ id: Date.now() + Math.random(), char: slot.char, correctLine: slot.correctLine, correctSlot: slot.correctSlot })
    }
    slot.char = dragChar.value.char
    slot.correctLine = dragChar.value.correctLine
    slot.correctSlot = dragChar.value.correctSlot
    pool.value.splice(dragFrom.value.idx, 1)
  } else if (dragFrom.value.type === 'slot') {
    const src = grid.value[dragFrom.value.lineIdx][dragFrom.value.slotIdx]
    const tempChar = slot.char
    const tempLine = slot.correctLine
    const tempSlot = slot.correctSlot
    slot.char = src.char
    slot.correctLine = src.correctLine
    slot.correctSlot = src.correctSlot
    src.char = tempChar
    src.correctLine = tempLine
    src.correctSlot = tempSlot
  }

  dragChar.value = null
  dragFrom.value = null
}

const onDropToPool = (e) => {
  e.preventDefault()
  if (!dragChar.value) return

  if (dragFrom.value.type === 'slot') {
    const src = grid.value[dragFrom.value.lineIdx][dragFrom.value.slotIdx]
    if (src.char !== null) {
      pool.value.push({ id: Date.now() + Math.random(), char: src.char, correctLine: src.correctLine, correctSlot: src.correctSlot })
      src.char = null
      src.correctLine = -1
      src.correctSlot = -1
    }
  }

  dragChar.value = null
  dragFrom.value = null
}

const onDragEnd = () => {
  dragChar.value = null
  dragFrom.value = null
}

const checkAnswer = () => {
  const userAnswer = grid.value.map(line => line.map(s => s.char || '').join('')).join('')
  if (userAnswer === correctAnswer) {
    solved.value = true
    playGlowEffect()
  } else {
    wrongFlash.value = true
    setTimeout(() => { wrongFlash.value = false }, 600)
  }
}

const playGlowEffect = () => {
  let col = 0
  const interval = setInterval(() => {
    glowPhase.value = col
    glowLine.value = -1
    let lineIdx = 0
    const lineInterval = setInterval(() => {
      glowLine.value = lineIdx
      lineIdx++
      if (lineIdx >= poem.length) {
        clearInterval(lineInterval)
      }
    }, 80)
    col++
    if (col >= 7) {
      clearInterval(interval)
      setTimeout(() => {
        glowPhase.value = -1
        glowLine.value = -1
        store.handlePoemEgg(true)
      }, 600)
    }
  }, 400)
}

const handleSkip = () => {
  store.handlePoemEgg(false)
}
</script>

<template>
  <div class="test-container animate-fade-in px-6 py-2" style="width: 1920px; padding: 8px;">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <h2 class="font-bold text-gray-800 mb-3 text-center text-2xl">📜 谜题诗</h2>
      <p class="text-gray-500 mb-6 text-center text-sm">
        将字块拖到正确位置，字块颜色提示了它应放的列
      </p>

      <!-- 诗句网格 -->
      <div class="space-y-2 mb-8">
        <div v-for="(line, lineIdx) in grid" :key="lineIdx" class="flex justify-center gap-2">
          <div
            v-for="(slot, slotIdx) in line"
            :key="`${lineIdx}-${slotIdx}`"
            @dragover="onDragOver"
            @drop="onDropToSlot($event, lineIdx, slotIdx)"
            class="w-12 h-12 rounded-xl flex items-center justify-center font-bold border-2 border-dashed border-gray-300 bg-gray-50 cursor-default transition-all duration-200 select-none text-xl"
            :class="{ 'border-primary bg-primary/5': dragChar && !solved }"
            :style="solved && glowPhase === slotIdx && glowLine === lineIdx ? {
              background: COLORS[slotIdx].bg,
              borderColor: COLORS[slotIdx].border,
              boxShadow: `0 0 12px 4px ${COLORS[slotIdx].border}`,
              transform: 'scale(1.15)'
            } : {}"
          >
            <span
              v-if="slot.char"
              draggable="true"
              @dragstart="onDragStartSlot($event, lineIdx, slotIdx)"
              @dragend="onDragEnd"
              class="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing rounded-xl transition-all duration-300"
              :style="{
                background: slot.correctLine === lineIdx && slot.correctSlot === slotIdx ? COLORS[slot.correctSlot].bg : 'transparent',
                color: slot.correctLine === lineIdx && slot.correctSlot === slotIdx ? COLORS[slot.correctSlot].text : '#9ca3af'
              }"
            >{{ slot.char }}</span>
            <span v-else class="text-gray-300">·</span>
          </div>
        </div>
      </div>

      <!-- 字块池 -->
      <div
        @dragover="onDragOver"
        @drop="onDropToPool"
        class="flex flex-wrap justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-xl min-h-[56px] border-2 border-dashed border-gray-200"
      >
        <div
          v-for="(item, idx) in pool"
          :key="item.id"
          draggable="true"
          @dragstart="onDragStartPool($event, idx)"
          @dragend="onDragEnd"
          class="w-12 h-12 rounded-xl flex items-center justify-center font-bold cursor-grab active:cursor-grabbing transition-all duration-200 select-none border-2 text-xl"
          :style="{
            background: item.correctSlot >= 0 ? COLORS[item.correctSlot].bg : '#fff',
            borderColor: item.correctSlot >= 0 ? COLORS[item.correctSlot].border : '#e5e7eb',
            color: item.correctSlot >= 0 ? COLORS[item.correctSlot].text : '#374151'
          }"
        >
          {{ item.char }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="space-y-4">
        <button
          v-if="!solved && allFilled"
          @click="checkAnswer"
          class="w-full py-4 px-8 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:opacity-90 transition-all text-xl"
          :class="{ 'animate-shake': wrongFlash }"
        >
          确认排列
        </button>

        <button
          v-if="!solved"
          @click="handleSkip"
          class="w-full py-4 px-8 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all text-xl"
        >
          跳过
        </button>
      </div>

      <p class="text-gray-400 mt-5 text-center text-xs">
        提示：拖动字块到格子中，拖回字块池可退回，拖拽格子间可交换
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
