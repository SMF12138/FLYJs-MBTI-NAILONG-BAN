<script setup>
import { computed } from 'vue'
import { useTestStore } from '../stores/test'
import { characters } from '../data/characters'
import RadarChart from './RadarChart.vue'

const store = useTestStore()

const DIMENSIONS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15']

const userVector = computed(() => {
  return DIMENSIONS.map(dim => (store.normalizedScores[dim] || 0) / 100)
})

const matchedCharacters = computed(() => {
  return characters.map(char => {
    const charVector = DIMENSIONS.map(dim => char.traits[dim] || 0)
    const weightVector = DIMENSIONS.map(dim => char.weights[dim] || 1)
    
    let dotProduct = 0
    let normUser = 0
    let normChar = 0
    
    for (let i = 0; i < DIMENSIONS.length; i++) {
      const weightedUser = userVector.value[i] * weightVector[i]
      const weightedChar = charVector[i] * weightVector[i]
      dotProduct += weightedUser * weightedChar
      normUser += weightedUser * weightedUser
      normChar += weightedChar * weightedChar
    }
    
    normUser = Math.sqrt(normUser)
    normChar = Math.sqrt(normChar)
    
    const similarity = (normUser > 0 && normChar > 0) 
      ? dotProduct / (normUser * normChar) 
      : 0
    
    return {
      ...char,
      similarity: Math.round(similarity * 100)
    }
  }).sort((a, b) => b.similarity - a.similarity)
})

const topMatch = computed(() => matchedCharacters.value[0])

const hiddenChallenges = computed(() => [
  { key: 'invitationClose', name: '邀请函隐藏条款', desc: '发现邀请函中的隐藏条款并提前关闭', found: store.foundEggs.invitationClose },
  { key: 'nameEgg', name: '还记得名字吗', desc: '在名字测试中找到隐藏的正确答案', found: store.foundEggs.nameEgg },
  { key: 'rescueEgg', name: '谁救了你', desc: '在救援测试中找到隐藏的正确答案', found: store.foundEggs.rescueEgg },
  { key: 'poemPuzzle', name: '谜题诗破解', desc: '正确排列全部诗句', found: store.foundEggs.poemPuzzle },
  { key: 'adCloseButton', name: '广告隐藏关闭', desc: '在广告页发现隐藏的关闭按钮', found: store.foundEggs.adCloseButton },
  { key: 'invitationCloseButton', name: '隐藏条款关闭按钮', desc: '在隐藏条款弹窗中发现隐藏的关闭按钮', found: store.foundEggs.invitationClose },
  { key: 'hpZero', name: '三气归来', desc: '三条命全部扣除触发血量清零特效', found: store.foundEggs.hpZero },
  { key: 'validCard', name: '输入银行卡号', desc: '在隐藏题中输入了合法的银行卡号', found: store.foundEggs.validCard },
])

const hiddenCount = computed(() => hiddenChallenges.value.filter(c => c.found).length)
</script>

<template>
  <div class="min-h-screen py-8 px-8">
    <div class="w-[1510px] max-w-[95%] mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">测试完成！</h1>
        <p class="text-gray-500 text-base">你的人格画像已生成</p>
      </div>

      <!-- 雷达图 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 text-center">15维度人格雷达图</h2>
        <RadarChart :scores="store.normalizedScores" />
      </div>

      <!-- 匹配角色 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">你最匹配的角色是...</h2>

        <div class="text-center">
          <div class="text-7xl mb-4">{{ topMatch.image }}</div>
          <h3 class="text-2xl font-bold text-primary mb-1">{{ topMatch.name }}</h3>
          <p class="text-gray-500 mb-3 text-base">{{ topMatch.title }}</p>
          <p class="text-gray-600 mb-6 max-w-lg mx-auto text-sm leading-relaxed">{{ topMatch.description }}</p>

          <div class="inline-block bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-semibold mb-6">
            匹配度：{{ topMatch.similarity }}%
          </div>

          <div class="bg-gray-50 rounded-xl p-6 text-left">
            <p class="text-gray-700 leading-relaxed text-sm">{{ topMatch.analysis_template }}</p>
          </div>
        </div>
      </div>

      <!-- 其他匹配角色 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-5">其他匹配角色</h2>
        <div class="space-y-3">
          <div
            v-for="char in matchedCharacters.slice(1, 4)"
            :key="char.id"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
          >
            <span class="text-4xl">{{ char.image }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-base truncate">{{ char.name }}</p>
              <p class="text-sm text-gray-500 truncate">{{ char.title }}</p>
            </div>
            <span class="text-primary font-semibold text-base flex-shrink-0">{{ char.similarity }}%</span>
          </div>
        </div>
      </div>

      <!-- 分数详情 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-5">维度分数详情</h2>
        <div class="space-y-2.5">
          <div
            v-for="(score, dim) in store.normalizedScores"
            :key="dim"
            class="flex items-center gap-3"
          >
            <span class="w-10 text-sm text-gray-500 font-medium flex-shrink-0">{{ dim }}</span>
            <div class="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
                :style="{ width: `${score}%` }"
              />
            </div>
            <span class="w-9 text-right text-sm font-semibold text-gray-600 flex-shrink-0">{{ score }}</span>
          </div>
        </div>
      </div>

      <!-- 隐藏关卡 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">🔓 隐藏关卡</h2>
        <p class="text-gray-500 text-sm mb-4">
          共 {{ hiddenChallenges.length }} 个隐藏挑战，你发现了 {{ hiddenCount }} 个
        </p>
        <div class="space-y-3">
          <div
            v-for="item in hiddenChallenges"
            :key="item.key"
            class="flex items-center gap-3 p-3 rounded-xl transition-all"
            :class="item.found ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'"
          >
            <span class="text-xl flex-shrink-0">{{ item.found ? '✅' : '❌' }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium" :class="item.found ? 'text-green-700' : 'text-gray-500'">{{ item.name }}</p>
              <p class="text-xs" :class="item.found ? 'text-green-500' : 'text-gray-400'">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 重新测试 -->
      <div class="text-center mt-8 mb-6">
        <button
          @click="store.currentStage = 'start'"
          class="btn-primary py-3 px-10 text-base"
        >
          重新测试
        </button>
      </div>
    </div>
  </div>
</template>
