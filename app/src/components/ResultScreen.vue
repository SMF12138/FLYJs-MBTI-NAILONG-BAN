<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { useTestStore } from '../stores/test'
import { DIMENSIONS, DIMENSION_IDS } from '../data/dimensions'
import { classifyArchetype, getArchetypeDisplay, getAllCharacters, getPairing } from '../data/archetypes'
import RadarChart from './RadarChart.vue'

const store = useTestStore()

// 结果页加载时给分数拍快照，避免后续成就加分改变已展示的角色和匹配
const snapshotScores = { ...store.normalizedScores }

// 格式化 desc：解析为 [{label, text}] 数组
const formatDesc = (desc) => {
  if (!desc) return []
  return desc.trim().split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const m = line.match(/^(【[^】]+】)(.*)$/)
    if (!m) return { label: '', text: line }
    return { label: m[1], text: m[2] }
  })
}

const dimNameMap = Object.fromEntries(DIMENSIONS.map(d => [d.id, d.key]))
const dimColorMap = Object.fromEntries(DIMENSIONS.map(d => [d.id, d.color]))
const dimDescMap = Object.fromEntries(DIMENSIONS.map(d => [d.id, d.desc]))
const selectedDim = ref(null)
const liked = ref(false)
const likeCount = ref(0)

try {
  liked.value = localStorage.getItem('mbti_liked') === 'true'
  likeCount.value = Number(localStorage.getItem('mbti_like_count')) || 0
} catch (e) {}

const handleLike = () => {
  if (liked.value) return
  liked.value = true
  try {
    localStorage.setItem('mbti_liked', 'true')
    const prev = Number(localStorage.getItem('mbti_like_count')) || 0
    const next = Math.max(prev + 1, Math.floor(Math.random() * 4001) + 1000)
    likeCount.value = next
    localStorage.setItem('mbti_like_count', String(next))
  } catch (e) {}
  store.dimensionScores.D7 += 1
  store.normalizeScores()
}

// ─── 结束测试流程 ───
const ending = ref(false)
const endPhase = ref('')
let endTimers = []
let bgm = null

const credits = [
  { role: '总监', name: '风秋' },
  { role: '策划', name: '莫风' },
  { role: '学术支持', name: '九歌' },
  { role: '评分算法', name: '牢白' },
  { role: '配音（女）', name: '茯苓、幼菊' },
  { role: '配音（男）', name: '沐风、三少' },
  { role: '视觉设计', name: '姬瑶' },
  { role: '开发', name: '风离' },
  { role: '测试', name: '风秋、莫风' },
]

const references = [
  'Jung, C.G. — 心理类型 (1921)',
  'Myers, I.B. & Briggs, K.C. — MBTI 指导手册',
  'McCrae & Costa — 大五人格理论 (1992)',
  'Bowlby, J. — 依恋理论 (1969)',
  'Kohlberg, L. — 道德发展阶段理论 (1981)',
  'Deci & Ryan — 自我决定理论 (1985)',
  'Batson, C.D. — 共情-利他假说 (1991)',
  'Aiken, L.R. — 耻感与罪感文化研究 (2002)',
]

const bgmCredit = 'Music: "The Past" by TAD — licensed under CC BY 4.0\nSource: https://opengameart.org/content/the-past'

const startEnding = () => {
  endTimers.forEach(t => clearTimeout(t))
  endTimers.length = 0
  ending.value = true
  endPhase.value = 'shaking'
  // 清理旧音频再创建新的
  if (bgm) { bgm.pause(); bgm.src = ''; bgm = null }
  bgm = new Audio('/the-past.mp3')
  bgm.volume = 0.5
  bgm.loop = true
  bgm.play().catch(() => {})
  endTimers.push(setTimeout(() => { endPhase.value = 'thanks' }, 10000))
  endTimers.push(setTimeout(() => { endPhase.value = 'credits' }, 12500))
  endTimers.push(setTimeout(() => { endPhase.value = 'refs' }, 22500))
  endTimers.push(setTimeout(() => { endPhase.value = 'done' }, 29500))
  endTimers.push(setTimeout(() => { if (bgm) { bgm.pause(); bgm.src = '' }; window.close() }, 33500))
}

onUnmounted(() => {
  endTimers.forEach(t => clearTimeout(t))
  if (bgm) { bgm.pause(); bgm.src = '' }
})

const toggleDim = (dim) => {
  selectedDim.value = selectedDim.value === dim ? null : dim
  store.handleDimClick(dim)
}

const getScoreTendency = (score) => {
  if (score >= 70) return { text: '极高', color: '#ef4444' }
  if (score >= 50) return { text: '偏高', color: '#f97316' }
  if (score >= 30) return { text: '中等', color: '#eab308' }
  if (score >= 15) return { text: '偏低', color: '#22c55e' }
  return { text: '极低', color: '#3b82f6' }
}

const userVector = computed(() => {
  return DIMENSION_IDS.map(dim => (store.normalizedScores[dim] || 0) / 100)
})

const userNorm = computed(() => {
  return Math.sqrt(userVector.value.reduce((sum, v) => sum + v * v, 0))
})

// 基础角色匹配度：4个主维度（D1/D5/D2/D4）差异的乘积，短板会被惩罚
const computeBaseSimilarity = (traits, uv) => {
  const primaryDims = ['D1', 'D5', 'D2', 'D4']
  let product = 1
  primaryDims.forEach(dim => {
    const userScore = uv[DIMENSION_IDS.indexOf(dim)]
    const target = traits[dim]
    const diff = Math.abs(userScore - target)
    product *= Math.max(0, 1 - diff)
  })
  return Math.round(product * 100)
}

const matchedCharacters = computed(() => {
  if (userNorm.value === 0) return []

  const all = getAllCharacters()
  const uv = userVector.value
  const userAlign = finalArchetype.value?.alignment || 'hero'

  // 主结果角色名，以及其正/反派对应名、已触发的特殊人格名（避免重复）
  const mainName = finalArchetype.value?.name
  const mainHeroName = archetypeResult.value?.heroName
  const mainVillainName = archetypeResult.value?.villainName
  const specialNames = new Set((finalArchetype.value?.specialTraits || []).map(t => t.name))
  const excludedNames = new Set([mainName, mainHeroName, mainVillainName, ...specialNames].filter(Boolean))

  return all
    .filter(char => !excludedNames.has(char.name))
    .map(char => {
      let similarity = 0
      if (char.alignment === 'special') {
        // 特殊人格：与卡片中 getSpecialTraits 算法一致，使用 0-100 原始分数
        const dim = Object.keys(char.traits).find(d => char.traits[d] !== 0.5)
        if (dim) {
          const userScore = store.normalizedScores[dim] || 0
          const target = char.traits[dim]
          if (target === 0.95) {
            similarity = Math.round(Math.max(0, 100 - (100 - userScore) / 95 * 100))
          } else if (target === 0.05) {
            similarity = Math.round(Math.max(0, 100 - userScore / 95 * 100))
          }
        }
      } else {
        similarity = computeBaseSimilarity(char.traits, uv)
      }

      // 同阵营加成：角色阵营与用户阵营一致时，匹配度加权1.15
      if (char.alignment === userAlign) {
        similarity = Math.round(Math.min(100, similarity * 1.15))
      }

      return { ...char, similarity }
    })
    .sort((a, b) => b.similarity - a.similarity)
})

const specialMatches = computed(() => matchedCharacters.value.filter(c => c.alignment === 'special').slice(0, 3))
const baseMatches = computed(() => matchedCharacters.value.filter(c => c.alignment !== 'special').slice(0, 3))

// ─── 原型+正邪 ───
const archetypeResult = ref(classifyArchetype(snapshotScores))
const isGreyZone = computed(() => archetypeResult.value.alignment === 'neutral')
const userAlignment = ref(null) // 'hero' | 'villain' | null (待选择)
const showChoice = computed(() => isGreyZone.value && !userAlignment.value)
const finalAlignment = computed(() => userAlignment.value || archetypeResult.value.alignment)
const finalArchetype = computed(() => {
  const r = archetypeResult.value
  if (showChoice.value) return null
  const align = finalAlignment.value
  const uv = userVector.value
  const display = getArchetypeDisplay(r.baseKey, align)
  const similarity = Math.round(Math.min(100, computeBaseSimilarity(r.traits, uv) * 1.15))
  return {
    ...r,
    alignment: align,
    alignmentLabel: align === 'hero' ? '正派' : '反派',
    verse: display.verse,
    img: display.img,
    name: display.name,
    desc: display.desc,
    similarity,
  }
})

// 天作之合 & 宿世之敌（依赖 archetypeResult、isGreyZone、userAlignment）
const pairing = computed(() => {
  if (isGreyZone.value && !userAlignment.value) return null
  // 用用户实际显示名查找（正派/反派各有独立配对）
  const displayName = finalArchetype.value?.name
  const heroName = archetypeResult.value?.heroName
  const villainName = archetypeResult.value?.villainName
  if (!displayName) return null
  const p = getPairing(displayName) || getPairing(heroName)
  if (!p || !p.soulmate || !p.nemesis) return null
  // 排除用户当前显示的角色（避免自己配对自己）
  const ownNames = new Set([displayName].filter(Boolean))
  if (ownNames.has(p.soulmate.name) || ownNames.has(p.nemesis.name)) return null
  return p
})

const chooseAlignment = (align) => {
  userAlignment.value = align
}

const extractLabel = (text) => {
  const match = text.match(/【(.+?)】/)
  return match ? match[1] : text.substring(0, 4)
}

const extractContent = (text) => {
  return text.replace(/【.+?】/, '').trim()
}

const hiddenChallenges = computed(() => {
  const list = [
    { key: 'invitationTerms', name: '邀请函隐藏条款', desc: '在邀请函底部发现了隐藏的条款链接', found: store.foundEggs.invitationTerms },
    { key: 'nameEgg', name: '还记得名字吗', desc: '在名字测试中找到隐藏的正确答案', found: store.foundEggs.nameEgg },
    { key: 'rescueEgg', name: '谁救了你', desc: '在救援测试中找到隐藏的正确答案', found: store.foundEggs.rescueEgg },
    { key: 'poemPuzzle', name: '谜题诗破解', desc: '正确排列全部诗句', found: store.foundEggs.poemPuzzle },
    { key: 'adCloseButton', name: '广告隐藏关闭', desc: '在广告页发现隐藏的关闭按钮', found: store.foundEggs.adCloseButton },
    { key: 'invitationClose', name: '条款弹窗逃生', desc: '在隐藏条款弹窗中找到了极隐蔽的关闭按钮', found: store.foundEggs.invitationClose },
    { key: 'hpZero', name: '三气归来', desc: '三条命全部扣除触发血量清零特效', found: store.foundEggs.hpZero },
    { key: 'validCard', name: '输入银行卡号', desc: '在隐藏题中输入了合法的银行卡号', found: store.foundEggs.validCard },
    { key: 'keyNavUsed', name: '键位切换题目', desc: '发现用↑↓键可以切换题目', found: store.foundEggs.keyNavUsed },
    { key: 'dimExplorer', name: '全维度探索者', desc: '查看了全部15个维度详情', found: store.foundEggs.dimExplorer },
    { key: 'liked', name: '精神股东', desc: '为作者点了赞', found: liked.value },
  ]
  return list
})

const unlockedChallenges = computed(() => hiddenChallenges.value.filter(c => c.found))
const lockedChallenges = computed(() => hiddenChallenges.value.filter(c => !c.found))

const hiddenCount = computed(() => hiddenChallenges.value.filter(c => c.found).length)
</script>

<template>
  <div class="min-h-screen py-8 px-8">
    <div class="w-[755px] max-w-[95%] mx-auto animate-fade-in">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2 gradient-text">测试完成！</h1>
        <p class="text-gray-400 text-base">你的人格画像已生成</p>
      </div>

      <!-- 雷达图 -->
      <div v-if="store.normalizedScores && Object.keys(store.normalizedScores).length > 0" class="glass-card p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4 text-center">
          <span class="gradient-text-cyan">15维度人格雷达图</span>
        </h2>
        <RadarChart :scores="store.normalizedScores" />
      </div>

      <!-- 灰色地带选择 -->
      <div v-if="showChoice && archetypeResult" class="glass-card p-6 sm:p-8 mb-6 glow-border">
        <h2 class="text-xl font-semibold text-white mb-4 text-center">
          <span class="gradient-text">你的灵魂正在抉择</span>
        </h2>

        <!-- 正邪百分比条 -->
        <div class="relative mb-8">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-yellow-400">光明面</span>
            <span class="text-purple-400">暗影面</span>
          </div>
          <div class="h-3 rounded-full bg-gray-800 overflow-hidden border border-gray-700 relative">
            <div class="absolute inset-0 rounded-full"
              :style="{ background: `linear-gradient(90deg, #fbbf24 0%, #a855f7 ${100 - archetypeResult.heroPct}%, #ef4444 100%)` }">
            </div>
            <div class="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg shadow-white/50"
              :style="{ left: (100 - archetypeResult.heroPct) + '%', transform: 'translateX(-50%)' }">
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>正派 {{ archetypeResult.heroPct }}%</span>
            <span>反派 {{ archetypeResult.villainPct }}%</span>
          </div>
        </div>

        <p class="text-center text-gray-400 text-base mb-8">
          你的测试结果处于灰色地带，未来的路，要靠你自己去抉择
        </p>

        <!-- 正反画像选择 -->
        <div class="grid grid-cols-2 gap-6">
          <button
            @click="chooseAlignment('hero')"
            class="group glass-card p-6 text-center cursor-pointer border-2 border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-500/5 transition-all duration-300"
          >
            <img :src="archetypeResult.heroImg" :alt="archetypeResult.heroName"
              @error="$event.target.style.display='none'"
              class="w-32 h-32 rounded-full mx-auto mb-3 object-cover border-2 border-yellow-500/30 group-hover:scale-105 transition-transform" />
            <h3 class="text-lg font-bold text-yellow-400 mb-1">{{ archetypeResult.heroName }}</h3>
            <p class="text-sm text-gray-500">选择光明之路</p>
          </button>
          <button
            @click="chooseAlignment('villain')"
            class="group glass-card p-6 text-center cursor-pointer border-2 border-red-500/30 hover:border-red-400 hover:bg-red-500/5 transition-all duration-300"
          >
            <img :src="archetypeResult.villainImg" :alt="archetypeResult.villainName"
              @error="$event.target.style.display='none'"
              class="w-32 h-32 rounded-full mx-auto mb-3 object-cover border-2 border-red-500/30 group-hover:scale-105 transition-transform" />
            <h3 class="text-lg font-bold text-red-400 mb-1">{{ archetypeResult.villainName }}</h3>
            <p class="text-sm text-gray-500">选择暗影之路</p>
          </button>
        </div>
      </div>

      <!-- 确定的阵营展示 -->
      <div v-if="!showChoice && finalArchetype" class="glass-card p-6 sm:p-8 mb-6 glow-border">
        <h2 class="text-xl font-semibold text-white mb-6 text-center">
          <span class="gradient-text">你最匹配的人物画像是...</span>
        </h2>

        <div class="text-center">
          <img :src="finalArchetype.img" :alt="finalArchetype.name"
            class="w-48 h-48 rounded-full mx-auto mb-4 object-cover border-4 animate-float"
            :class="finalArchetype.alignment === 'hero' ? 'border-yellow-500/50' : 'border-red-500/50'" />
          <h3 class="text-3xl font-bold gradient-text mb-1">{{ finalArchetype.name }}</h3>

          <div class="inline-flex items-center gap-3 mb-4">
            <span :class="finalArchetype.alignment === 'hero' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : finalArchetype.alignment === 'villain' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'"
              class="px-4 py-1 rounded-full text-sm font-semibold border">
              {{ finalArchetype.alignmentLabel }}
            </span>
            <span class="px-4 py-1 rounded-full text-sm font-semibold border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              匹配度 {{ finalArchetype.similarity }}%
            </span>
          </div>

          <p class="text-gray-300 mb-4 max-w-lg mx-auto text-base leading-relaxed">
            {{ finalArchetype.verse }}
          </p>

          <!-- 特殊人格 -->
          <div v-if="finalArchetype.specialTraits && finalArchetype.specialTraits.length > 0" class="mt-6 space-y-4">
            <div v-for="trait in finalArchetype.specialTraits" :key="trait.dim"
              class="relative group"
            >
              <div
                class="glass-card p-4 border transition-all group-hover:scale-[1.01]"
                :class="trait.type === 'high' ? 'bg-gradient-to-r from-amber-500/8 to-yellow-500/5 border-amber-500/30' : 'bg-gradient-to-r from-blue-500/8 to-cyan-500/5 border-blue-500/30'"
              >
                <div class="flex items-center gap-4">
                  <img :src="trait.img" :alt="trait.name"
                    class="w-16 h-16 rounded-full object-cover border-2 flex-shrink-0"
                    :class="trait.type === 'high' ? 'border-amber-500/30' : 'border-blue-500/30'" />
                  <div class="flex-1 min-w-0 text-left">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xl">{{ trait.emoji }}</span>
                      <p class="text-lg font-bold"
                        :class="trait.type === 'high' ? 'text-amber-400' : 'text-blue-400'"
                      >{{ trait.name }}</p>
                      <span class="text-xs px-2 py-0.5 rounded-full border"
                        :class="trait.type === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'"
                      >{{ trait.type === 'high' ? '高分特殊' : '低分特殊' }}</span>
                      <span class="text-xs px-2 py-0.5 rounded-full border bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      >匹配度 {{ trait.similarity }}%</span>
                    </div>
                    <p class="text-sm text-gray-300 leading-relaxed">{{ trait.verse }}</p>
                  </div>
                </div>
              </div>
              <!-- 人物介绍浮层 -->
              <div class="absolute bottom-full left-0 right-0 mb-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                <div class="glass-card p-4 border border-gray-600/50 shadow-xl">
                  <div class="text-sm text-gray-300 leading-relaxed text-left">
                    <p v-for="(seg, i) in formatDesc(trait.desc)" :key="i"><span v-if="seg.label" class="desc-label" :class="'desc-label-' + (i % 5)">{{ seg.label.replace(/^【|】$/g, '') }}</span><span style="white-space: pre-line;">{{ seg.text }}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 人格解析卡片 -->
      <div v-if="!showChoice && finalArchetype && finalArchetype.desc" class="mb-6">
        <div class="glass-card overflow-hidden glow-border">
          <!-- 标题栏 -->
          <div class="px-6 py-4 border-b border-white/5"
            :class="finalArchetype.alignment === 'hero' ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5' : 'bg-gradient-to-r from-red-500/10 to-rose-500/5'">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold">
                <span class="gradient-text">人格解析</span>
              </h2>
              <span class="text-xs px-2 py-0.5 rounded-full ml-auto"
                :class="finalArchetype.alignment === 'hero' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'">
                {{ finalArchetype.alignmentLabel }}
              </span>
            </div>
          </div>

          <!-- 内容区 -->
          <div class="p-6 space-y-4">
            <div v-for="(paragraph, i) in finalArchetype.desc.split('\n').filter(p => p.trim())" :key="i"
              class="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01]"
              :class="[
                i % 5 === 0 ? 'bg-gradient-to-r from-violet-500/8 to-purple-500/5 border border-violet-500/15' :
                i % 5 === 1 ? 'bg-gradient-to-r from-cyan-500/8 to-blue-500/5 border border-cyan-500/15' :
                i % 5 === 2 ? 'bg-gradient-to-r from-amber-500/8 to-orange-500/5 border border-amber-500/15' :
                i % 5 === 3 ? 'bg-gradient-to-r from-emerald-500/8 to-teal-500/5 border border-emerald-500/15' :
                'bg-gradient-to-r from-rose-500/8 to-pink-500/5 border border-rose-500/15'
              ]">
              <!-- 维度标题标签 -->
              <div class="flex items-center gap-2 mb-2.5">
                <span class="px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide"
                  :class="[
                    i % 5 === 0 ? 'bg-violet-500/20 text-violet-400' :
                    i % 5 === 1 ? 'bg-cyan-500/20 text-cyan-400' :
                    i % 5 === 2 ? 'bg-amber-500/20 text-amber-400' :
                    i % 5 === 3 ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-rose-500/20 text-rose-400'
                  ]">
                  {{ extractLabel(paragraph) }}
                </span>
              </div>
              <!-- 正文 -->
              <p class="text-gray-300 text-sm leading-relaxed">{{ extractContent(paragraph) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 基础画像匹配 -->
      <div class="glass-card p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-white mb-5">
          <span class="gradient-text-cyan">基础画像匹配</span>
        </h2>
        <div class="space-y-3">
          <div
            v-for="(char, index) in baseMatches"
            :key="char.id"
            class="relative group"
          >
            <div
              class="flex items-center gap-4 p-4 glass-card border-l-4 transition-all duration-300 group-hover:translate-x-2"
              :class="[
                index === 0 ? 'border-purple-500' :
                index === 1 ? 'border-cyan-500' :
                'border-pink-500'
              ]"
            >
              <img :src="char.img" :alt="char.name"
                class="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-600" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-white text-base truncate">{{ char.name }}</p>
                <p class="text-sm text-gray-400 truncate">{{ char.verse }}</p>
              </div>
              <span class="text-cyan-400 font-semibold text-base flex-shrink-0 neon-text-cyan">{{ char.similarity }}%</span>
            </div>
            <!-- 人物介绍浮层 -->
            <div class="absolute bottom-full left-0 right-0 mb-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
              <div class="glass-card p-4 border border-gray-600/50 shadow-xl">
                <div class="text-sm text-gray-300 leading-relaxed text-left">
                  <p v-for="(seg, i) in formatDesc(char.desc)" :key="i"><span v-if="seg.label" class="desc-label" :class="'desc-label-' + (i % 5)">{{ seg.label.replace(/^【|】$/g, '') }}</span><span style="white-space: pre-line;">{{ seg.text }}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 特殊人格匹配 -->
      <div v-if="specialMatches.length > 0" class="glass-card p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-white mb-5">
          <span class="gradient-text">特殊人格匹配</span>
        </h2>
        <div class="space-y-3">
          <div
            v-for="(char, index) in specialMatches"
            :key="char.id"
            class="relative group"
          >
            <div
              class="flex items-center gap-4 p-4 glass-card border-l-4 transition-all duration-300 group-hover:translate-x-2"
              :class="[
                index === 0 ? 'border-amber-500' :
                index === 1 ? 'border-cyan-500' :
                'border-pink-500'
              ]"
            >
              <img :src="char.img" :alt="char.name"
                class="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-600" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xl">{{ char.emoji }}</span>
                  <p class="text-base font-bold text-white truncate">{{ char.name }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full border"
                    :class="char.type === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'"
                  >{{ char.type === 'high' ? '高分特殊' : '低分特殊' }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full border bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  >匹配度 {{ char.similarity }}%</span>
                </div>
                <p class="text-sm text-gray-400 truncate">{{ char.verse }}</p>
              </div>
            </div>
            <!-- 人物介绍浮层 -->
            <div class="absolute bottom-full left-0 right-0 mb-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
              <div class="glass-card p-4 border border-gray-600/50 shadow-xl">
                <div class="text-sm text-gray-300 leading-relaxed text-left">
                  <p v-for="(seg, i) in formatDesc(char.desc)" :key="i"><span v-if="seg.label" class="desc-label" :class="'desc-label-' + (i % 5)">{{ seg.label.replace(/^【|】$/g, '') }}</span><span style="white-space: pre-line;">{{ seg.text }}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="mt-4 text-sm text-amber-400 text-center font-medium px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          特殊人格由单维度标准触发，匹配度仅供参考，排行不计入总测试结果
        </p>
      </div>

      <!-- 天作之合 & 宿世之敌 -->
      <div v-if="pairing && pairing.soulmate && pairing.nemesis" class="grid grid-cols-2 gap-4 mb-6">
        <!-- 天作之合 -->
        <div class="glass-card p-5 border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-orange-500/5">
          <h3 class="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
            <span class="text-lg">💕</span> 天作之合
          </h3>
          <div class="flex items-center gap-3">
            <img :src="pairing.soulmate.img" :alt="pairing.soulmate.name"
              class="w-14 h-14 rounded-full object-cover border-2 border-pink-500/30"
              @error="$event.target.style.display='none'" />
            <div class="flex-1 min-w-0">
              <p class="text-white font-bold text-base truncate">{{ pairing.soulmate.name }}</p>
              <p class="text-gray-400 text-sm truncate mt-1">{{ pairing.soulmate.verse }}</p>
            </div>
          </div>
        </div>

        <!-- 宿世之敌 -->
        <div class="glass-card p-5 border border-red-500/20 bg-gradient-to-br from-red-500/5 to-purple-500/5">
          <h3 class="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <span class="text-lg">⚔️</span> 宿世之敌
          </h3>
          <div class="flex items-center gap-3">
            <img :src="pairing.nemesis.img" :alt="pairing.nemesis.name"
              class="w-14 h-14 rounded-full object-cover border-2 border-red-500/30"
              @error="$event.target.style.display='none'" />
            <div class="flex-1 min-w-0">
              <p class="text-white font-bold text-base truncate">{{ pairing.nemesis.name }}</p>
              <p class="text-gray-400 text-sm truncate mt-1">{{ pairing.nemesis.verse }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 分数详情 -->
      <div class="glass-card p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-white mb-5">
          <span class="gradient-text">维度分数详情</span>
        </h2>
        <div class="space-y-3">
          <div
            v-for="(score, dim) in store.normalizedScores"
            :key="dim"
            class="flex items-center gap-3"
          >
            <button
              @click="toggleDim(dim)"
              class="flex-shrink-0 px-3 py-1 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105 cursor-pointer border"
              :style="{
                background: selectedDim === dim ? dimColorMap[dim] : 'transparent',
                color: selectedDim === dim ? '#fff' : dimColorMap[dim],
                borderColor: dimColorMap[dim]
              }"
            >
              {{ dimNameMap[dim] || dim }}
            </button>
            <div class="flex-1 h-6 rounded-full overflow-hidden relative border border-gray-700/50"
              :style="{
                background: 'linear-gradient(90deg, rgba(248,113,113,0.2), rgba(251,146,60,0.2), rgba(250,204,21,0.2), rgba(74,222,128,0.2), rgba(34,211,238,0.2), rgba(96,165,250,0.2), rgba(167,139,250,0.2), rgba(248,113,113,0.2))',
                backgroundSize: '200% 100%',
                animation: 'wave-rainbow 4s linear infinite'
              }">
              <!-- 填充条 -->
              <div
                class="absolute inset-y-0 left-0 rounded-full overflow-hidden transition-all duration-1200 ease-out"
                :style="{ width: score + '%' }"
              >
                <div class="w-full h-full animate-slide-fill"
                  :style="{ background: 'linear-gradient(90deg, rgba(167,139,250,0.5), rgba(96,165,250,0.5), rgba(34,211,238,0.5), rgba(74,222,128,0.5), rgba(250,204,21,0.5), rgba(251,146,60,0.5), rgba(248,113,113,0.5))', backgroundSize: '200% 100%' }"
                ></div>
              </div>
              <!-- 蓝紫光波 -->
              <div class="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div class="absolute inset-0 animate-flash-silver"></div>
              </div>
            </div>
            <span class="w-12 text-right text-sm font-bold flex-shrink-0 tabular-nums" :style="{ color: dimColorMap[dim] }">{{ score }}</span>
          </div>

          <!-- 展开的维度描述 -->
          <Transition name="slide">
            <div v-if="selectedDim" class="glass-card p-4 mt-2 border-l-4" :style="{ borderColor: dimColorMap[selectedDim] }">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-lg font-bold" :style="{ color: dimColorMap[selectedDim] }">{{ dimNameMap[selectedDim] }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-bold" :style="{ background: getScoreTendency(store.normalizedScores[selectedDim]).color + '20', color: getScoreTendency(store.normalizedScores[selectedDim]).color }">
                  {{ getScoreTendency(store.normalizedScores[selectedDim]).text }}
                </span>
              </div>
              <p class="text-gray-300 text-sm leading-relaxed">{{ dimDescMap[selectedDim] }}</p>
              <p class="text-gray-500 text-xs mt-2">得分：{{ store.normalizedScores[selectedDim] }}/100</p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 隐藏关卡 -->
      <div class="glass-card p-6 mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">
          <span>🔓 </span><span class="gradient-text">隐藏关卡</span>
        </h2>
        <p class="text-gray-400 text-sm mb-4">
          共 11 个隐藏挑战，你发现了 {{ hiddenCount }} 个
        </p>
        <div class="space-y-3">
          <div
            v-for="item in hiddenChallenges.filter(c => c.found)"
            :key="item.key"
            class="flex items-center gap-3 p-3 rounded-xl transition-all"
            :class="item.key === 'liked' ? 'bg-pink-500/10 border border-pink-500/30' : item.key === 'dimExplorer' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-green-500/10 border border-green-500/30'"
          >
            <span class="text-xl flex-shrink-0">{{ item.key === 'dimExplorer' ? '🏆' : item.key === 'liked' ? '❤️' : '✅' }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium" :class="item.key === 'dimExplorer' && item.found ? 'text-yellow-400' : item.key === 'liked' ? 'text-pink-400' : item.found ? 'text-green-400' : 'text-gray-500'">{{ item.name }}</p>
              <p class="text-xs" :class="item.key === 'dimExplorer' && item.found ? 'text-yellow-400/70' : item.key === 'liked' ? 'text-pink-400/70' : item.found ? 'text-green-400/70' : 'text-gray-600'">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 重新测试 + 结束测试 -->
      <div class="text-center mt-8 mb-6 flex items-center justify-center gap-4">
        <button
          @click="store.startTest()"
          :disabled="ending"
          class="btn-primary py-3 px-10 text-base"
          :class="{ 'opacity-30 pointer-events-none': ending }"
        >
          <span class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重新测试
          </span>
        </button>
        <button
          @click="startEnding"
          :disabled="ending"
          class="py-3 px-10 text-base rounded-2xl border-2 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-all"
          :class="{ 'opacity-30 pointer-events-none': ending }"
        >
          结束测试
        </button>
      </div>
    </div>

    <!-- 点赞浮动按钮 -->
    <div class="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
      <button
        v-if="!liked"
        @click="handleLike"
        class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-110 transition-all duration-300 cursor-pointer animate-pulse"
      >
        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      <p v-if="!liked" class="text-pink-400/70 text-xs whitespace-nowrap">给作者点个赞吧</p>
      <div v-if="liked" class="text-center">
        <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <p class="text-pink-400 text-xs font-medium whitespace-nowrap animate-fade-in">
          第 {{ likeCount }} 位
        </p>
      </div>
    </div>

    <!-- 结束流程遮罩 -->
    <Transition name="fade">
      <div v-if="ending" class="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
        <!-- 震荡阶段：隐藏关卡弹出 -->
        <div v-if="endPhase === 'shaking'" class="w-[600px] max-w-[90%]">
          <!-- 已解锁 -->
          <div v-if="unlockedChallenges.length > 0" class="mb-6">
            <h2 class="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-sm">✓</span>
              已解锁 ({{ unlockedChallenges.length }}/{{ hiddenChallenges.length }})
            </h2>
            <div class="space-y-2">
              <div v-for="(item, i) in unlockedChallenges" :key="item.key"
                class="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20 animate-shake-item"
                :style="{ animationDelay: i * 0.15 + 's' }">
                <span class="text-xl">{{ item.key === 'dimExplorer' ? '🏆' : item.key === 'liked' ? '❤️' : '✅' }}</span>
                <div>
                  <p class="text-sm font-medium text-green-400">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 未解锁 -->
          <div v-if="lockedChallenges.length > 0">
            <h2 class="text-lg font-bold text-gray-500 mb-3 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center text-sm">🔒</span>
              未解锁 ({{ lockedChallenges.length }})
            </h2>
            <div class="space-y-2">
              <div v-for="(item, i) in lockedChallenges" :key="item.key"
                class="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800 opacity-50 animate-shake-item"
                :style="{ animationDelay: (unlockedChallenges.length + i) * 0.15 + 's' }">
                <span class="text-xl">🔒</span>
                <div>
                  <p class="text-sm font-medium text-gray-500">{{ item.name }}</p>
                  <p class="text-xs text-gray-600">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 感谢阶段 -->
        <div v-if="endPhase === 'thanks'" class="text-center animate-fade-up">
          <p class="text-4xl font-bold text-white mb-4" style="text-shadow: 0 0 30px rgba(255,255,255,0.3);">感谢您的测试</p>
          <p class="text-gray-400 text-lg">Your feedback means a lot to us</p>
        </div>

        <!-- 制作名单滚动 -->
        <div v-if="endPhase === 'credits'" class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="animate-roll-up space-y-8 text-center">
            <div v-for="(c, i) in credits" :key="i" class="animate-fade-up" :style="{ animationDelay: i * 0.3 + 's' }">
              <p class="text-gray-500 text-sm tracking-widest uppercase mb-1">{{ c.role }}</p>
              <p class="text-white text-2xl font-bold">{{ c.name }}</p>
            </div>
            <!-- FLYJ制作组 -->
            <div class="pt-8 animate-fade-up" :style="{ animationDelay: credits.length * 0.3 + 's' }">
              <p class="text-5xl font-black gradient-text" style="text-shadow: 0 0 40px rgba(168,85,247,0.5);">FLYJ 制作组</p>
            </div>
          </div>
        </div>

        <!-- 引用文献 -->
        <div v-if="endPhase === 'refs'" class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="animate-roll-up space-y-4 text-center max-w-xl">
            <p class="text-gray-500 text-sm tracking-widest uppercase mb-6">参考文献 References</p>
            <p v-for="(ref, i) in references" :key="i" class="text-gray-400 text-sm animate-fade-up" :style="{ animationDelay: i * 0.2 + 's' }">
              {{ ref }}
            </p>
            <!-- 背景音乐 -->
            <div class="mt-8 pt-6 border-t border-gray-700/50 animate-fade-up" :style="{ animationDelay: references.length * 0.2 + 0.3 + 's' }">
              <p class="text-gray-500 text-sm tracking-widest uppercase mb-3">背景音乐 Background Music</p>
              <p class="text-gray-400 text-sm whitespace-pre-line">{{ bgmCredit }}</p>
            </div>
          </div>
        </div>

        <!-- 结尾 -->
        <div v-if="endPhase === 'done'" class="text-center animate-fade-up">
          <p class="text-6xl font-black gradient-text mb-4" style="text-shadow: 0 0 60px rgba(168,85,247,0.6);">FLYJ 制作组</p>
          <p class="text-gray-500 text-base mt-6">测试结束</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.desc-label {
  display: inline-block;
  font-size: 0.75rem;
  color: #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.05em 0.45em;
  margin-right: 0.35em;
  vertical-align: baseline;
  white-space: nowrap;
  line-height: 1.6;
  font-weight: 700;
}
.desc-label-0 { background: rgba(139, 92, 246, 0.3); border: 1px solid rgba(139, 92, 246, 0.5); }
.desc-label-1 { background: rgba(59, 130, 246, 0.3); border: 1px solid rgba(59, 130, 246, 0.5); }
.desc-label-2 { background: rgba(234, 179, 8, 0.3); border: 1px solid rgba(234, 179, 8, 0.5); }
.desc-label-3 { background: rgba(34, 197, 94, 0.3); border: 1px solid rgba(34, 197, 94, 0.5); }
.desc-label-4 { background: rgba(239, 68, 68, 0.3); border: 1px solid rgba(239, 68, 68, 0.5); }
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes wave-rainbow {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.animate-wave-rainbow {
  background-size: 200% 100%;
  animation: wave-rainbow 4s linear infinite;
}

@keyframes slide-fill {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.animate-slide-fill {
  animation: slide-fill 3s linear infinite;
}

@keyframes flash-silver {
  0% { background: linear-gradient(90deg, transparent 0%, transparent 100%); }
  40% { background: linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.2) 50%, transparent 100%); }
  100% { background: linear-gradient(90deg, transparent 0%, transparent 100%); }
}
.animate-flash-silver {
  animation: flash-silver 3s ease-in-out infinite;
}

/* 结束流程动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes shake-item {
  0% { transform: translateX(-8px) scale(0.95); opacity: 0; }
  20% { transform: translateX(6px) scale(1.02); }
  40% { transform: translateX(-4px) scale(0.98); }
  60% { transform: translateX(2px) scale(1.01); }
  80% { transform: translateX(-1px) scale(1); }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
.animate-shake-item {
  opacity: 0;
  animation: shake-item 0.6s ease-out forwards;
}

@keyframes fade-up {
  0% { transform: translateY(30px); opacity: 0; filter: blur(6px); }
  100% { transform: translateY(0); opacity: 1; filter: blur(0); }
}
.animate-fade-up {
  opacity: 0;
  animation: fade-up 0.8s ease-out forwards;
}

@keyframes roll-up {
  0% { transform: translateY(60px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-roll-up {
  animation: roll-up 1s ease-out forwards;
}
</style>
