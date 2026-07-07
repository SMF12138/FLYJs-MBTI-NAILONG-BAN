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

  introAudio.addEventListener('ended', () => {
    introReady.value = true
  }, { once: true })

  trackTimer(() => {
    if (!introReady.value) introReady.value = true
  }, introText.length * 60 + 1000)
}

onMounted(() => {
  startTypewriter()
})

const correctAnswer = poem.join('')

watch(() => store.currentStage, (newStage) => {
  if (newStage !== 'poemEgg') {
    introAudio.pause()
    introAudio.currentTime = 0
    readAudio.pause()
    readAudio.currentTime = 0
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null }
    cleanupPointerListeners()
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
  cleanupPointerListeners()
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
const wrongFlash = ref(null)

// ── 统一交互（点击 + 拖拽） ──
// 只有三种操作模式：
//   mode='none'       - 无操作
//   mode='pick'       - 刚刚选中了一个字块（等待操作）
//   mode='drag'       - 正在拖拽中
const dragState = ref({ mode: 'none' })

// 记录 pointerdown 时的位置，用于区分点击和拖拽
let pointerStart = null

function cleanupPointerListeners() {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
}

// ── 核心操作函数 ──

// 从池子或槽位"拿起"一个字块
function pickUp(char, correctLine, correctSlot, source) {
  dragState.value = { mode: 'pick', char, correctLine, correctSlot, source }
}

// 放到指定槽位（lineIdx, slotIdx）
function placeToSlot(lineIdx, slotIdx) {
  if (dragState.value.mode === 'none') return

  const { char, correctLine, correctSlot, source } = dragState.value
  const target = grid.value[lineIdx][slotIdx]

  if (source.type === 'pool') {
    // 从池子放到槽位
    const poolItem = pool.value.find(p => p.char === char && p.correctLine === correctLine && p.correctSlot === correctSlot)
    if (!poolItem) return

    if (target.char !== null) {
      // 目标有字 → 交换回池子
      pool.value.push({ id: Date.now() + Math.random(), char: target.char, correctLine: target.correctLine, correctSlot: target.correctSlot })
    }
    target.char = char
    target.correctLine = correctLine
    target.correctSlot = correctSlot
    const idx = pool.value.indexOf(poolItem)
    if (idx >= 0) pool.value.splice(idx, 1)
  } else if (source.type === 'slot') {
    // 从槽位放到槽位 → 交换
    const src = grid.value[source.lineIdx]?.[source.slotIdx]
    if (!src) return

    const tempChar = target.char
    const tempLine = target.correctLine
    const tempSlot = target.correctSlot
    target.char = src.char
    target.correctLine = src.correctLine
    target.correctSlot = src.correctSlot
    src.char = tempChar
    src.correctLine = tempLine
    src.correctSlot = tempSlot
  }

  dragState.value = { mode: 'none' }
}

// 退回池子
function returnToPool() {
  if (dragState.value.mode === 'none') return
  const { source } = dragState.value
  if (source.type === 'slot') {
    const src = grid.value[source.lineIdx]?.[source.slotIdx]
    if (src && src.char !== null) {
      pool.value.push({ id: Date.now() + Math.random(), char: src.char, correctLine: src.correctLine, correctSlot: src.correctSlot })
      src.char = null
      src.correctLine = -1
      src.correctSlot = -1
    }
  }
  dragState.value = { mode: 'none' }
}

// ── 点击交互 ──

function onSlotClick(lineIdx, slotIdx) {
  const slot = grid.value[lineIdx][slotIdx]

  if (dragState.value.mode === 'pick') {
    // 已有选中字块
    if (slot.char) {
      // 目标有字 → 交换
      placeToSlot(lineIdx, slotIdx)
    } else {
      // 目标为空 → 放入
      placeToSlot(lineIdx, slotIdx)
    }
  } else if (dragState.value.mode === 'none') {
    // 没有选中字块 → 点选槽位上的字块
    if (slot.char) {
      pickUp(slot.char, slot.correctLine, slot.correctSlot, { type: 'slot', lineIdx, slotIdx })
    }
  }
}

function onPoolClick(idx) {
  if (dragState.value.mode === 'pick') {
    // 有选中字块 → 退回池子
    returnToPool()
  } else if (dragState.value.mode === 'none') {
    const item = pool.value[idx]
    if (!item) return
    pickUp(item.char, item.correctLine, item.correctSlot, { type: 'pool', idx })
  }
}

// ── 拖拽交互（PC 指针事件 + 触屏） ──

function onPointerDown(e, type, arg1, arg2) {
  // 只用于启动拖拽，不干扰点击
  if (e.button !== 0 && !e.touches) return
  pointerStart = { x: e.clientX ?? e.touches[0].clientX, y: e.clientY ?? e.touches[0].clientY, time: Date.now(), type, arg1, arg2 }

  // 注册全局 move/up 监听
  document.addEventListener('pointermove', onPointerMove, { passive: false })
  document.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e) {
  if (!pointerStart) return
  const dx = Math.abs(e.clientX - pointerStart.x)
  const dy = Math.abs(e.clientY - pointerStart.y)

  // 移动超过 6px 才启动拖拽
  if (dx > 6 || dy > 6) {
    // 如果还没进入拖拽模式，启动
    if (dragState.value.mode !== 'drag') {
      const { type, arg1, arg2 } = pointerStart
      if (type === 'slot') {
        const slot = grid.value[arg1]?.[arg2]
        if (!slot?.char) return
        dragState.value = {
          mode: 'drag',
          char: slot.char,
          correctLine: slot.correctLine,
          correctSlot: slot.correctSlot,
          source: { type: 'slot', lineIdx: arg1, slotIdx: arg2 }
        }
      } else if (type === 'pool') {
        const item = pool.value[arg1]
        if (!item) return
        dragState.value = {
          mode: 'drag',
          char: item.char,
          correctLine: item.correctLine,
          correctSlot: item.correctSlot,
          source: { type: 'pool', idx: arg1 }
        }
      }
    }
  }
}

function onPointerUp(e) {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)

  if (dragState.value.mode === 'drag') {
    // 拖拽结束，找目标位置
    const hit = getSlotElement(e)
    if (hit && hit.type === 'slot') {
      placeToSlot(hit.lineIdx, hit.slotIdx)
    } else {
      returnToPool()
    }
  } else if (dragState.value.mode === 'pick') {
    // 如果是 pick 状态可能是从拖拽降级为点击（没拖起来）, 保持 pick 状态
  }

  pointerStart = null
}

function getSlotElement(e) {
  const x = e.clientX
  const y = e.clientY
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  let cur = el
  while (cur && cur !== document.body) {
    if (cur.dataset && cur.dataset.slotIdx !== undefined)
      return { type: 'slot', lineIdx: parseInt(cur.dataset.lineIdx), slotIdx: parseInt(cur.dataset.slotIdx) }
    if (cur.dataset && cur.dataset.pool !== undefined)
      return { type: 'pool' }
    cur = cur.parentElement
  }
  return null
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
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style="background: radial-gradient(circle, rgba(147,51,234,0.4) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite;">
        </div>
        <div class="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
          style="background: radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%); animation: float 4s ease-in-out infinite;">
        </div>
      </div>

      <div class="relative z-10 max-w-3xl mx-auto px-8 text-center">
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
            <span v-if="typedChars < introText.length" class="inline-block w-[3px] h-[1.2em] bg-purple-400 ml-1 align-middle" style="animation: blink 0.8s step-end infinite;"></span>
          </p>
        </div>

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
              :data-slot-idx="slotIdx" :data-line-idx="lineIdx"
              @pointerdown="onPointerDown($event, 'slot', lineIdx, slotIdx)"
              @click.stop="onSlotClick(lineIdx, slotIdx)"
              class="w-12 h-12 rounded-xl flex items-center justify-center font-bold border-2 border-dashed transition-all duration-200 select-none text-xl cursor-pointer"
              :class="[
                dragState.mode !== 'none' ? 'border-purple-500/50 bg-purple-500/5' : 'border-gray-700 bg-gray-800/50',
                dragState.mode !== 'none' && dragState.source?.type === 'slot' && dragState.source.lineIdx === lineIdx && dragState.source.slotIdx === slotIdx ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent' : ''
              ]"
              :style="revealLine === lineIdx && revealSlot === slotIdx ? {
                background: COLORS[slotIdx].bg, borderColor: COLORS[slotIdx].border,
                boxShadow: `0 0 16px 6px ${COLORS[slotIdx].border}`, transform: 'scale(1.2)', color: COLORS[slotIdx].text
              } : { color: slot.correctLine === lineIdx && slot.correctSlot === slotIdx ? COLORS[slot.correctSlot].text : '#6b7280' }"
            >
              <span class="w-full h-full flex items-center justify-center rounded-xl transition-all duration-300 select-none" :class="{ 'cursor-grab': !slot.char, 'cursor-pointer': slot.char }">{{ slot.char || '·' }}</span>
            </div>
          </div>
        </div>

        <div data-pool="true"
          class="flex flex-wrap justify-center gap-2 mb-8 p-4 glass-card min-h-[56px] border-2 border-dashed border-gray-700"
          @click.stop="onPoolClick(-1)">
          <div v-for="(item, idx) in pool" :key="item.id"
            :data-pool-item="idx"
            @pointerdown="onPointerDown($event, 'pool', idx)"
            @click.stop="onPoolClick(idx)"
            class="w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-200 select-none border-2 text-xl cursor-pointer"
            :class="{ 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent': dragState.mode !== 'none' && dragState.source?.type === 'pool' && dragState.source.idx === idx }"
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
        <p class="text-gray-500 mt-5 text-center text-xs">提示：点击选中字块，再点击目标位置放置。或直接拖拽字块到格子中。</p>
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
