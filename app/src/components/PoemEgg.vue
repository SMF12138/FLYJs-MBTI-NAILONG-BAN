<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
  { bg: 'rgba(220, 38, 38, 0.15)', border: 'rgba(252, 165, 165, 0.4)', text: '#fca5a5' },
  { bg: 'rgba(234, 88, 12, 0.15)', border: 'rgba(253, 186, 116, 0.4)', text: '#fdba74' },
  { bg: 'rgba(202, 138, 4, 0.15)', border: 'rgba(253, 224, 71, 0.4)', text: '#fde047' },
  { bg: 'rgba(22, 163, 74, 0.15)', border: 'rgba(134, 239, 172, 0.4)', text: '#86efac' },
  { bg: 'rgba(8, 145, 178, 0.15)', border: 'rgba(103, 232, 249, 0.4)', text: '#67e8f9' },
  { bg: 'rgba(37, 99, 235, 0.15)', border: 'rgba(147, 197, 253, 0.4)', text: '#93c5fd' },
  { bg: 'rgba(147, 51, 234, 0.15)', border: 'rgba(216, 180, 254, 0.4)', text: '#d8b4fe' }
]

// ── 打字机引言 ──
const introText = '但没等你做出抉择，突然间，一道声音出现在了你的脑海里，只见这声音朗声吟道：'
const showIntro = ref(true)
const typedChars = ref(0)
const introReady = ref(false)
let typeTimer = null
const poemTimers = []
let revealIntervalId = null

function trackTimer(fn, ms) {
  const id = setTimeout(fn, ms)
  poemTimers.push(id)
  return id
}

// 音频
const introAudio = new Audio('/poem-intro.wav')
const readAudio = new Audio('/poem-read.wav')

const startTypewriter = () => {
  typedChars.value = 0
  introAudio.currentTime = 0
  introAudio.play().catch(() => {})

  const interval = setInterval(() => {
    typedChars.value++
    if (typedChars.value >= introText.length) {
      clearInterval(interval)
      typeTimer = null
    }
  }, 60)
  typeTimer = interval

  // 音频播完后显示按钮
  introAudio.addEventListener('ended', () => {
    introReady.value = true
  }, { once: true })

  // 兜底：如果音频比打字短，打字结束后也显示按钮
  trackTimer(() => {
    if (!introReady.value) introReady.value = true
  }, introText.length * 60 + 1000)
}

onMounted(() => {
  startTypewriter()
  document.addEventListener('touchmove', onPointerMove, { passive: false })
  document.addEventListener('touchend', onPointerEnd)
})

const correctAnswer = poem.join('')

// 阶段切换时停止所有音频
watch(() => store.currentStage, (newStage) => {
  if (newStage !== 'poemEgg') {
    introAudio.pause()
    introAudio.currentTime = 0
    readAudio.pause()
    readAudio.currentTime = 0
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null }
  }
})

onUnmounted(() => {
  if (typeTimer) clearInterval(typeTimer)
  if (revealIntervalId) { clearInterval(revealIntervalId); revealIntervalId = null }
  poemTimers.forEach(id => clearTimeout(id))
  poemTimers.length = 0
  introAudio.pause()
  introAudio.currentTime = 0
  readAudio.pause()
  readAudio.currentTime = 0
  document.removeEventListener('touchmove', onPointerMove)
  document.removeEventListener('touchend', onPointerEnd)
})

const enterPuzzle = () => {
  introAudio.pause()
  introAudio.currentTime = 0
  showIntro.value = false
  readAudio.currentTime = 0
  readAudio.play().catch(() => {})
}

// ── 拼诗逻辑 ──
const grid = ref([])
const pool = ref([])
const solved = ref(false)
const showOverlay = ref(false)
const revealLine = ref(-1)
const revealSlot = ref(-1)
const showBanner = ref(false)
const flashActive = ref(false)
const particles = ref([])
const dragChar = ref(null)
const dragFrom = ref(null)
const wrongFlash = ref(null)

// ── 触屏拖拽兼容 ──
const touchDrag = ref(null)
const touchGhost = ref(null)

const getPointer = (e) => {
  if (!e) return { x: 0, y: 0 }
  const t = e.touches ? e.touches[0] : e
  return { x: t.clientX, y: t.clientY }
}

// 获取手指下命中哪个槽位（grid 或 pool）
const getSlotAtPoint = (x, y) => {
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  const slot = el.closest('[data-slot-idx]')
  if (slot) {
    return { type: 'slot', lineIdx: parseInt(slot.dataset.lineIdx), slotIdx: parseInt(slot.dataset.slotIdx) }
  }
  const poolEl = el.closest('[data-pool]')
  if (poolEl) return { type: 'pool' }
  return null
}

const onPointerDownSlot = (e, lineIdx, slotIdx) => {
  if (!(e.touches && e.touches.length > 0) && e.pointerType !== 'touch') return
  const slot = grid.value[lineIdx][slotIdx]
  if (!slot.char) return
  e.preventDefault()
  dragChar.value = { char: slot.char, correctLine: slot.correctLine, correctSlot: slot.correctSlot }
  dragFrom.value = { type: 'slot', lineIdx, slotIdx }
  const p = getPointer(e)
  touchDrag.value = { x: p.x, y: p.y }
}

const onPointerDownPool = (e, idx) => {
  e.preventDefault()
  dragChar.value = { char: pool.value[idx].char, correctLine: pool.value[idx].correctLine, correctSlot: pool.value[idx].correctSlot }
  dragFrom.value = { type: 'pool', idx }
  const p = getPointer(e)
  touchDrag.value = { x: p.x, y: p.y }
}

const onPointerMove = (e) => {
  if (!dragChar.value || !touchDrag.value) return
  e.preventDefault()
  const p = getPointer(e)
  touchDrag.value.x = p.x
  touchDrag.value.y = p.y
  // 实时高亮手指下的槽位
  const hit = getSlotAtPoint(p.x, p.y)
  if (hit && hit.type === 'slot') {
    const slot = grid.value[hit.lineIdx][hit.slotIdx]
    if (slot) slot._hover = true
  }
}

const onPointerEnd = (e) => {
  if (!dragChar.value || !dragFrom.value) return
  if (e && e.changedTouches) e.preventDefault()
  const p = getPointer(e.changedTouches ? e : e)
  const hit = getSlotAtPoint(p.x, p.y)
  
  if (hit && hit.type === 'slot') {
    onDropToSlot({}, hit.lineIdx, hit.slotIdx)
  } else {
    onDropToPool({})
  }
  touchDrag.value = null
}

const onPointerUpPool = (e) => {
  if (!dragChar.value || !dragFrom.value) return
  if (e && e.preventDefault) e.preventDefault()
  onDropToPool({})
  touchDrag.value = null
}



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
  if (!dragChar.value || !dragFrom.value) return

  const slot = grid.value[lineIdx][slotIdx]

  if (dragFrom.value.type === 'pool') {
    const srcIdx = dragFrom.value.idx
    if (srcIdx < 0 || srcIdx >= pool.value.length) return

    if (slot.char !== null) {
      pool.value.push({ id: Date.now() + Math.random(), char: slot.char, correctLine: slot.correctLine, correctSlot: slot.correctSlot })
    }
    slot.char = dragChar.value.char
    slot.correctLine = dragChar.value.correctLine
    slot.correctSlot = dragChar.value.correctSlot
    pool.value.splice(srcIdx, 1)
  } else if (dragFrom.value.type === 'slot') {
    const src = grid.value[dragFrom.value.lineIdx]?.[dragFrom.value.slotIdx]
    if (!src) return
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

  // 清理触屏 hover 状态
  grid.value.forEach(line => line.forEach(s => { delete s._hover }))
  dragChar.value = null
  dragFrom.value = null
}

const onDropToPool = (e) => {
  e.preventDefault()
  if (!dragChar.value || !dragFrom.value) return

  if (dragFrom.value.type === 'slot') {
    const src = grid.value[dragFrom.value.lineIdx]?.[dragFrom.value.slotIdx]
    if (src && src.char !== null) {
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
    trackTimer(() => { wrongFlash.value = false }, 600)
  }
}

const playGlowEffect = () => {
  showOverlay.value = true
  flashActive.value = true

  for (let i = 0; i < 50; i++) {
    trackTimer(() => {
      particles.value.push({
        id: Date.now() + Math.random(),
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 60,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * 7)].text,
        duration: Math.random() * 1.5 + 0.5
      })
    }, i * 30)
  }

  let charIdx = 0
  const totalChars = poem.join('').length

  revealIntervalId = setInterval(() => {
    const lineIdx = Math.floor(charIdx / 7)
    const slotIdx = charIdx % 7
    revealLine.value = lineIdx
    revealSlot.value = slotIdx
    charIdx++

    if (charIdx >= totalChars) {
      clearInterval(revealIntervalId)
      revealIntervalId = null
      trackTimer(() => { showBanner.value = true }, 300)
      trackTimer(() => {
        showOverlay.value = false
        showBanner.value = false
        revealLine.value = -1
        revealSlot.value = -1
        flashActive.value = false
        particles.value = []
        store.handlePoemEgg(true)
      }, 2500)
    }
  }, 50)
}

const handleSkip = () => {
  store.handlePoemEgg(false)
}
</script>

<template>
  <div>
    <!-- ═══ 打字机引言界面 ═══ -->
    <div v-if="showIntro" class="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <!-- 背景光效 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style="background: radial-gradient(circle, rgba(147,51,234,0.4) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite;">
        </div>
        <div class="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
          style="background: radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%); animation: float 4s ease-in-out infinite;">
        </div>
      </div>

      <!-- 打字机内容 -->
      <div class="relative z-10 max-w-3xl mx-auto px-8 text-center">
        <!-- 霓虹光标文字 -->
        <div class="min-h-[200px] flex items-center justify-center">
          <p class="text-2xl sm:text-3xl leading-relaxed text-gray-200">
            <span v-for="(char, i) in introText.slice(0, typedChars)" :key="i"
              class="inline"
              :style="{
                opacity: i === typedChars - 1 ? 1 : 0.85,
                textShadow: i === typedChars - 1 ? '0 0 20px rgba(147,51,234,0.8), 0 0 40px rgba(147,51,234,0.4)' : 'none',
                transition: 'text-shadow 0.3s ease'
              }"
            >{{ char }}</span>
            <!-- 光标 -->
            <span v-if="typedChars < introText.length" class="inline-block w-[3px] h-[1.2em] bg-purple-400 ml-1 align-middle" style="animation: blink 0.8s step-end infinite;"></span>
          </p>
        </div>

        <!-- 点击继续 -->
        <Transition name="fade">
          <button
            v-if="introReady"
            @click="enterPuzzle"
            class="mt-12 px-10 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xl font-bold rounded-2xl hover:opacity-90 transition-all btn-primary animate-fade-in"
          >
            聆听诗句 ✨
          </button>
        </Transition>
      </div>
    </div>

    <!-- ═══ 成功特效 overlay ═══ -->
    <Transition name="fade">
      <div v-if="showOverlay" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/80" :class="{ 'flash-white': flashActive }"></div>
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div v-for="p in particles" :key="p.id" class="absolute rounded-full"
            :style="{ left: p.x + '%', top: p.y + '%', width: p.size + 'px', height: p.size + 'px', background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}`, animation: `particle-burst ${p.duration}s ease-out forwards` }" />
        </div>
        <Transition name="banner">
          <div v-if="showBanner" class="relative z-10 text-center">
            <div class="text-7xl mb-6 animate-bounce">✨</div>
            <h1 class="text-5xl font-bold gradient-text mb-4">解谜成功</h1>
            <p class="text-2xl text-gray-300">诗句已完整还原</p>
            <div class="mt-6 flex justify-center gap-3">
              <span v-for="(c, i) in COLORS" :key="i" class="w-4 h-4 rounded-full" :style="{ background: c.text, boxShadow: `0 0 10px ${c.text}` }" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ═══ 拼诗界面 ═══ -->
    <div v-if="!showIntro" class="test-container animate-fade-in px-6 py-2" style="width: 960px; padding: 4px;">
      <div class="glass-card p-8 glow-border">
        <div class="text-center mb-6">
          <div class="text-5xl mb-4 animate-float">📜</div>
          <h2 class="font-bold text-white text-center text-2xl gradient-text">谜题诗</h2>
        </div>
        <p class="text-gray-400 mb-6 text-center text-sm">将字块拖到正确位置，字块颜色提示了它应放的列</p>

        <div class="space-y-2 mb-8">
          <div v-for="(line, lineIdx) in grid" :key="lineIdx" class="flex justify-center gap-2">
            <div v-for="(slot, slotIdx) in line" :key="`${lineIdx}-${slotIdx}`"
              @dragover="onDragOver" @drop="onDropToSlot($event, lineIdx, slotIdx)"
              @touchstart="onPointerDownSlot($event, lineIdx, slotIdx)"
              class="w-12 h-12 rounded-xl flex items-center justify-center font-bold border-2 border-dashed transition-all duration-200 select-none text-xl touch-none"
              :class="[dragChar && !solved ? 'border-purple-500/50 bg-purple-500/5' : 'border-gray-700 bg-gray-800/50']"
              :style="revealLine === lineIdx && revealSlot === slotIdx ? {
                background: COLORS[slotIdx].bg, borderColor: COLORS[slotIdx].border,
                boxShadow: `0 0 16px 6px ${COLORS[slotIdx].border}`, transform: 'scale(1.2)', color: COLORS[slotIdx].text
              } : { color: slot.correctLine === lineIdx && slot.correctSlot === slotIdx ? COLORS[slot.correctSlot].text : '#6b7280' }"
            >
              <span v-if="slot.char" draggable="true" @dragstart="onDragStartSlot($event, lineIdx, slotIdx)" @dragend="onDragEnd"
                class="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing rounded-xl transition-all duration-300">{{ slot.char }}</span>
              <span v-else class="text-gray-700">·</span>
            </div>
          </div>
        </div>

        <div @dragover="onDragOver" @drop="onDropToPool" @touchend="onPointerUpPool"
          class="flex flex-wrap justify-center gap-2 mb-8 p-4 glass-card min-h-[56px] border-2 border-dashed border-gray-700">
          <div v-for="(item, idx) in pool" :key="item.id" draggable="true"
            @dragstart="onDragStartPool($event, idx)" @dragend="onDragEnd"
            @touchstart="onPointerDownPool($event, idx)" @touchend="onPointerEnd"
            class="w-12 h-12 rounded-xl flex items-center justify-center font-bold cursor-grab active:cursor-grabbing transition-all duration-200 select-none border-2 text-xl touch-none"
            :style="{ background: item.correctSlot >= 0 ? COLORS[item.correctSlot].bg : 'rgba(20,20,35,0.8)', borderColor: item.correctSlot >= 0 ? COLORS[item.correctSlot].border : 'rgba(75,85,99,0.5)', color: item.correctSlot >= 0 ? COLORS[item.correctSlot].text : '#9ca3af' }">
            {{ item.char }}
          </div>
        </div>

        <div class="space-y-4">
          <button v-if="!solved && allFilled" @click="checkAnswer"
            class="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all text-xl btn-primary"
            :class="{ 'animate-shake': wrongFlash }">确认排列</button>
          <button v-if="!solved" @click="handleSkip"
            class="w-full py-4 px-8 border-2 border-gray-700 text-gray-400 font-bold rounded-2xl hover:border-gray-500 hover:text-gray-200 transition-all text-xl">跳过</button>
        </div>
        <p class="text-gray-500 mt-5 text-center text-xs">提示：拖动字块到格子中，拖回字块池可退回，拖拽格子间可交换</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
.animate-shake { animation: shake 0.4s ease-in-out; }
@keyframes particle-burst { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0) translate(50px,-80px)} }
.flash-white { animation: flash 0.3s ease-out; }
@keyframes flash { 0%{background:rgba(255,255,255,0.4)} 100%{background:rgba(0,0,0,0.8)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
.fade-enter-active,.fade-leave-active{transition:opacity .3s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
.banner-enter-active{animation:banner-in .6s cubic-bezier(.34,1.56,.64,1)}
.banner-leave-active{animation:banner-out .4s ease-in}
@keyframes banner-in{0%{opacity:0;transform:scale(.5) translateY(30px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes banner-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.2)}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.2}50%{transform:scale(1.1);opacity:.3}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
</style>
