import { defineStore } from 'pinia'
import { normalQuestions } from '../data/questions'
import { speedQuestions } from '../data/speedQuestions'
import { eggTriggers } from '../data/eggTriggers'
import { DIMENSION_IDS } from '../data/dimensions'

// 彩蛋发现记录的 key 列表
const EGG_KEYS = ['nameEgg', 'rescueEgg', 'adCloseButton', 'poemPuzzle', 'invitationTerms', 'invitationClose', 'hpZero', 'validCard', 'keyNavUsed', 'dimExplorer']

export const useTestStore = defineStore('test', {
  state: () => ({
    currentStage: 'start',
    currentQuestionIndex: 0,
    currentSpeedIndex: 0,

    hp: 3,
    maxHp: 3,

    dimensionScores: Object.fromEntries(DIMENSION_IDS.map(id => [id, 0])),

    normalizedScores: {},

    // 彩蛋分数记录（单独存储，用于归一化时计算）
    eggScores: Object.fromEntries(DIMENSION_IDS.map(id => [id, 0])),

    questions: normalQuestions,
    speedQs: speedQuestions,

    // 速答倒计时
    speedTimer: 0,
    isSpeedTimerRunning: false,

    // HP 动画
    showHpLoss: false,
    hpLossMessage: '',
    hpLossCount: 0,
    showHpZeroEffect: false,

    // 1元测试
    show1YuanTest: false,
    yuanTestStage: 'idle',

    // 邀请函
    showInvitation: false,
    invitationLayer: 1,
    showInvitationContent: false,
    showHiddenTerms: false,

    // 谜题诗
    showPoemPuzzle: false,

    // 广告
    showAd: false,

    // 彩蛋记录
    foundEggs: Object.fromEntries(EGG_KEYS.map(k => [k, false])),
    clickedDims: Object.fromEntries(DIMENSION_IDS.map(d => [d, false])),

    _pendingHiddenEggStage: null,
    _pendingNextAfterEffect: false,
    _pendingAnswer: null,
    _invitationShown: false,
    _scoredQuestions: new Set(),
    _triggeredEggKeys: new Set(),

    // 统一 Timer 管理
    _timers: {}
  }),

  getters: {
    currentQuestion: (state) => {
      if (state.currentStage === 'normal') {
        return state.questions[state.currentQuestionIndex] || null
      }
      return null
    },

    currentSpeedQuestion: (state) => {
      if (state.currentStage === 'speed') {
        return state.speedQs[state.currentSpeedIndex] || null
      }
      return null
    },

    totalQuestions: (state) => state.questions.length,

    progress: (state) => {
      if (state.currentStage === 'normal') {
        return ((state.currentQuestionIndex + 1) / state.questions.length) * 100
      }
      return 100
    },
  },

  actions: {
    // ─── Timer 管理 ───
    _setTimer(name, fn, ms) {
      this._clearTimer(name)
      this._timers[name] = setTimeout(fn, ms)
    },

    _setInterval(name, fn, ms) {
      this._clearTimer(name)
      this._timers[name] = setInterval(fn, ms)
    },

    _clearTimer(name) {
      if (this._timers[name]) {
        clearTimeout(this._timers[name])
        clearInterval(this._timers[name])
        delete this._timers[name]
      }
    },

    _clearAllTimers() {
      Object.keys(this._timers).forEach(name => this._clearTimer(name))
    },

    _applyQuestionScores(question, optionId) {
      for (const [dim, data] of Object.entries(question.dimensions)) {
        const score = data[optionId] || 0
        const weight = data.weight || 1
        this.dimensionScores[dim] += score * weight
      }
    },

    _applyLastAnswerScores() {
      if (!this._pendingAnswer) return
      const { questionId, optionId, isSpeed } = this._pendingAnswer
      this._pendingAnswer = null
      const source = isSpeed ? this.speedQs : this.questions
      const question = source.find(q => q.id === questionId)
      if (!question) return
      this._applyQuestionScores(question, optionId)
      if (!isSpeed) {
        const hiddenStage = this.checkEggTriggersAfterQuestion(questionId, optionId)
        if (hiddenStage) {
          this._pendingHiddenEggStage = hiddenStage
        }
      }
    },

    // ─── 生命周期 ───
    startTest() {
      this._clearAllTimers()
      this.currentStage = 'normal'
      this.currentQuestionIndex = 0
      this.currentSpeedIndex = 0
      this.hp = this.maxHp
      this.show1YuanTest = false
      this.showInvitation = false
      this.showPoemPuzzle = false
      this.showAd = false
      this.showHpLoss = false
      this.showHpZeroEffect = false
      this.foundEggs = Object.fromEntries(EGG_KEYS.map(k => [k, false]))
      this.clickedDims = Object.fromEntries(DIMENSION_IDS.map(d => [d, false]))
      this.eggScores = Object.fromEntries(DIMENSION_IDS.map(id => [id, 0]))
      this._invitationShown = false
      this._pendingHiddenEggStage = null
      this._pendingNextAfterEffect = false
      this._pendingAnswer = null
      this._scoredQuestions = new Set()
      this._triggeredEggKeys = new Set()
      this.hpLossCount = 0
      this.isSpeedTimerRunning = false
      this.speedTimer = 0
      this.resetDimensionScores()
    },

    resetDimensionScores() {
      DIMENSION_IDS.forEach(id => { this.dimensionScores[id] = 0 })
    },

    // ─── 答题 ───
    answerQuestion(questionId, optionId) {
      const question = this.questions.find(q => q.id === questionId)
      if (!question) {
        console.warn(`[testStore] Question not found: ${questionId}`)
        return
      }

      if (this._scoredQuestions.has(questionId)) return

      const option = question.options.find(o => o.id === optionId)
      if (option && option.hpCost) {
        this.loseHp(option.hpCost)
        this._pendingNextAfterEffect = true
        this._pendingAnswer = { questionId, optionId }
        this._scoredQuestions.add(questionId)
        return
      }

      this._scoredQuestions.add(questionId)
      this._applyQuestionScores(question, optionId)

      const hiddenStage = this.checkEggTriggersAfterQuestion(questionId, optionId)
      if (hiddenStage) {
        this._pendingHiddenEggStage = hiddenStage
        return
      }

      if (this.currentStage === 'normal') {
        this.nextQuestion()
      }
    },

    // ─── 彩蛋触发（配置驱动）───
    checkEggTriggersAfterQuestion(questionId, optionId) {
      for (const trigger of eggTriggers) {
        if (trigger.trigger.afterQuestion === questionId) {
          if (trigger.trigger.option && trigger.trigger.option !== optionId) continue
          const key = `${questionId}:${optionId}:${trigger.stage}`
          if (this._triggeredEggKeys.has(key)) continue
          this._triggeredEggKeys.add(key)
          this._enterEggStage(trigger)
          return trigger.stage
        }
      }
      return null
    },

    checkBeforeQuestion() {
      for (const trigger of eggTriggers) {
        if (trigger.trigger.beforeQuestion) {
          const q = this.questions[this.currentQuestionIndex]
          if (q && q.id === trigger.trigger.beforeQuestion) {
            const key = `before:${trigger.trigger.beforeQuestion}:${trigger.stage}`
            if (this._triggeredEggKeys.has(key)) continue
            this._triggeredEggKeys.add(key)
            this._invitationShown = true
            this._enterEggStage(trigger)
            return true
          }
        }
      }
      return false
    },

    _enterEggStage(trigger) {
      this.currentStage = trigger.stage
      if (trigger.stage === 'ad') this.showAd = true
      if (trigger.stage === 'poemEgg') this.showPoemPuzzle = true
      if (trigger.stage === 'invitation') {
        this.showInvitation = true
        this.invitationLayer = 1
        this.showInvitationContent = false
        this.showHiddenTerms = false
      }
    },

    // ─── 邀请函 ───
    handleInvitationView(elapsed) {
      this.invitationClickTime = Date.now()
      // <5秒加分, 5-20秒不变, >20秒扣分
      this.eggScores.D3 += elapsed < 5000 ? 0.5 * 5 : elapsed > 20000 ? -0.5 * 5 : 0
      this.eggScores.D5 += 0.5 * 2
      this.eggScores.D8 += 0.3 * 3
      this.eggScores.D2 += 0.3 * 3
      this.eggScores.D13 += -0.3 * 3
      this.invitationLayer = 2
      this.showInvitationContent = true
    },

    handleInvitationIgnore() {
      this.eggScores.D5 += -0.5 * 2
      this.eggScores.D8 += -0.3 * 3
      this.eggScores.D2 += -0.3 * 3
      this.eggScores.D13 += 0.5 * 3
      this.showInvitation = false
      this.currentStage = 'normal'
    },

    handleHiddenTermsClicked() {
      this.foundEggs.invitationTerms = true
      this.showHiddenTerms = true
      this._setTimer('hiddenTerms', () => {
        this.eggScores.D1 += 0.8 * 4
        this.eggScores.D5 += 0.5 * 2
        this.normalizeScores()  // 重新计算
        this.closeInvitation()
      }, 10000)
    },

    handleHiddenTermsCloseButton() {
      this.foundEggs.invitationClose = true
      this.showHiddenTerms = false
      this._clearTimer('hiddenTerms')
      this.eggScores.D1 += 0.8 * 4
      this.eggScores.D5 += 0.5 * 2
      this.normalizeScores()  // 重新计算
      this.closeInvitation()
    },

    closeInvitationWithoutClick() {
      this._invitationPath = 'viewNoHidden'
      this.eggScores.D8 += 0.5 * 3
      this.eggScores.D13 += 0.5 * 3
      this.closeInvitation()
    },

    closeInvitation() {
      this._clearTimer('hiddenTerms')
      this.showInvitation = false
      this.showInvitationContent = false
      this.showHiddenTerms = false
      this.currentStage = 'normal'
    },

    // ─── 彩蛋结果处理 ───
    _handleBinaryEgg(found, eggKey, foundScores, notFoundScores) {
      if (found) this.foundEggs[eggKey] = true
      const scores = found ? foundScores : notFoundScores
      for (const [dim, score] of Object.entries(scores)) {
        this.eggScores[dim] += score
      }
      this.currentStage = 'normal'
      this._pendingHiddenEggStage = null
      this.nextQuestion()
    },

    handleNameEgg(found) {
      this._handleBinaryEgg(found, 'nameEgg', { D1: 0.8 * 4 }, { D1: -0.5 * 4 })
    },

    handlePoemEgg(solved) {
      if (solved) {
        this.foundEggs.poemPuzzle = true
        this.dimensionScores.D1 += 0.8 * 5
        this.dimensionScores.D5 += 0.5 * 5
        this.dimensionScores.D12 += 0.5 * 5
      }
      this.showPoemPuzzle = false
      this.currentStage = 'normal'
      this._pendingHiddenEggStage = null
      this.nextQuestion()
    },

    handleRescueEgg(found) {
      this._handleBinaryEgg(found, 'rescueEgg', { D1: 0.8 * 4 }, { D1: -0.5 * 4 })
    },

    handleAdCloseButton() {
      this.foundEggs.adCloseButton = true
      this.eggScores.D1 += 0.8 * 4
      this.normalizeScores()  // 重新计算
      this._clearAllTimers()
      this.showAd = false
      this.currentStage = 'normal'
      this._pendingHiddenEggStage = null
      this.nextQuestion()
    },

    handleAdEnd() {
      this._clearAllTimers()
      this.showAd = false
      this.currentStage = 'normal'
      this.nextQuestion()
    },

    handleKeyNav() {
      if (!this.foundEggs.keyNavUsed) {
        this.foundEggs.keyNavUsed = true
        this.eggScores.D1 += 1
      }
    },

    handleDimClick(dim) {
      if (this.clickedDims[dim]) return
      this.clickedDims[dim] = true
      const count = Object.values(this.clickedDims).filter(v => v).length
      if (count === 15 && !this.foundEggs.dimExplorer) {
        this.foundEggs.dimExplorer = true
        this.eggScores.D1 += 1
        this.eggScores.D5 += 1
        this.normalizeScores()  // 重新计算
      }
    },

    // ─── HP ───
    loseHp(amount = 1) {
      this._clearTimer('hpLoss')
      this._clearTimer('hpZero')
      this.hp = Math.max(0, this.hp - amount)
      this.showHpLoss = true
      this.hpLossCount++

      const messages = [
        '我还有强敌未收拾！',
        '我还有罪孽未还清！',
        '我还有错误未纠正！'
      ]
      this.hpLossMessage = messages[Math.min(this.hpLossCount - 1, messages.length - 1)]
    },

    dismissHpLoss() {
      this.showHpLoss = false
      if (this.hp === 0) {
        this.showHpZeroEffect = true
        return
      }
      this._resumeAfterEffect()
    },

    dismissHpZero() {
      this.foundEggs.hpZero = true
      this.showHpZeroEffect = false
      this.hp = 1
      this._resumeAfterEffect()
    },

    _resumeAfterEffect() {
      if (!this._pendingNextAfterEffect) return
      this._pendingNextAfterEffect = false
      const wasSpeed = this._pendingAnswer?.isSpeed
      this._applyLastAnswerScores()
      if (wasSpeed) {
        this.nextSpeedQuestion()
      } else if (this.currentStage === 'normal') {
        this.nextQuestion()
      }
    },

    // ─── 速答 ───
    answerSpeedQuestion(questionId, optionId) {
      const question = this.speedQs.find(q => q.id === questionId)
      if (!question) return
      if (this._pendingNextAfterEffect) return

      if (this._scoredQuestions.has(questionId)) return
      this._scoredQuestions.add(questionId)

      const option = question.options.find(o => o.id === optionId)
      if (option && option.hpCost) {
        this._scoredQuestions.add(questionId)
        this.loseHp(option.hpCost)
        this._pendingNextAfterEffect = true
        this._pendingAnswer = { questionId, optionId, isSpeed: true }
        this.stopSpeedTimer()
        return
      }

      this._applyQuestionScores(question, optionId)

      this.stopSpeedTimer()
      this.nextSpeedQuestion()
    },

    handleSpeedTimeout(questionId) {
      const question = this.speedQs.find(q => q.id === questionId)
      if (!question) return
      this.eggScores.D1 -= 0.2
      this.eggScores.D3 -= 0.2
      this.answerSpeedQuestion(questionId, question.defaultAnswer)
    },

    startSpeedTimer(questionId) {
      if (this.isSpeedTimerRunning) return
      const question = this.speedQs.find(q => q.id === questionId)
      if (!question) return

      this.speedTimer = question.timeLimit
      this.isSpeedTimerRunning = true

      this._setInterval('speed', () => {
        this.speedTimer--
        if (this.speedTimer <= 0) {
          this.handleSpeedTimeout(questionId)
        }
      }, 1000)
    },

    stopSpeedTimer() {
      this._clearTimer('speed')
      this.isSpeedTimerRunning = false
    },

    // ─── 流程控制 ───
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        if (this.checkBeforeQuestion()) return
      } else {
        this.finishNormalStage()
      }
    },

    nextSpeedQuestion() {
      if (this.currentSpeedIndex < this.speedQs.length - 1) {
        this.currentSpeedIndex++
        this.startSpeedTimer(this.speedQs[this.currentSpeedIndex].id)
      } else {
        this.finishSpeedStage()
      }
    },

    finishNormalStage() {
      this.currentStage = 'speed'
      this.currentSpeedIndex = 0
      this.startSpeedTimer(this.speedQs[0].id)
    },

    finishSpeedStage() {
      this.currentStage = '1yuan'
      this.show1YuanTest = true
      this.yuanTestStage = 'confirm'
    },

    // ─── 1元测试 ───
    handle1YuanConfirm(elapsed) {
      this.eggScores.D3 += elapsed < 5000 ? 0.8 * 5 : elapsed > 20000 ? -0.5 * 5 : 0
      this.eggScores.D14 += 0.5 * 4
      this.yuanTestStage = 'input'
    },

    handle1YuanCancel(elapsed) {
      this.eggScores.D3 += elapsed < 5000 ? 0.8 * 5 : elapsed > 20000 ? -0.5 * 5 : 0
      this.eggScores.D14 += -0.5 * 4
      this.eggScores.D8 += -0.5 * 4
      this.finish1YuanTest()
    },

    handle1YuanInput(hasInput) {
      if (hasInput) {
        this.foundEggs.validCard = true
        this.eggScores.D8 += 0.5 * 4
        this.eggScores.D14 += 0.8 * 4
        this.eggScores.D11 += 0.5 * 3
      } else {
        this.eggScores.D8 += 0.5 * 4
        this.eggScores.D14 += -0.3 * 4
        this.eggScores.D11 += -0.3 * 2
      }
      this.finish1YuanTest()
    },

    finish1YuanTest() {
      this.show1YuanTest = false
      this.currentStage = 'result'
      this.normalizeScores()
    },

    // ─── 分数归一化（基于每个维度独立计算理论最大/最小，按实际得分比例映射）───
    // 核心原则：
    // 1. 每个维度独立计算，只考虑涉及该维度的题目
    // 2. 理论最大值 = 所有涉及题都选该维度最高分
    // 3. 理论最小值 = 所有涉及题都选该维度最低分
    // 4. 题目分数映射到 [0, 100]，彩蛋分数作为额外加分
    // 5. 最终分数 = 映射分 + 彩蛋分，上限 100
    // 6. 未涉及维度 = 0（不是 50）
    normalizeScores() {
      const allQuestions = [...this.questions, ...this.speedQs]
      
      // 计算每个维度的理论极值（仅题目）
      const dimStats = {}
      for (const dim of DIMENSION_IDS) {
        dimStats[dim] = { 
          min: 0, 
          max: 0, 
          questionCount: 0,
          actual: this.dimensionScores[dim]
        }
      }
      
      // 遍历所有题目，累加每个维度的理论最大/最小
      for (const q of allQuestions) {
        if (!q.dimensions) continue
        for (const [dim, data] of Object.entries(q.dimensions)) {
          if (!dimStats[dim]) continue
          
          // 提取所有选项分值（排除 weight 字段）
          const optionScores = []
          for (const [key, val] of Object.entries(data)) {
            if (key !== 'weight' && typeof val === 'number') {
              optionScores.push(val)
            }
          }
          
          if (optionScores.length === 0) continue
          
          const weight = data.weight || 1
          const maxScore = Math.max(...optionScores) * weight
          const minScore = Math.min(...optionScores) * weight
          
          dimStats[dim].max += maxScore
          dimStats[dim].min += minScore
          dimStats[dim].questionCount++
        }
      }
      
      // 归一化
      for (const dim of DIMENSION_IDS) {
        const stats = dimStats[dim]
        
        if (stats.questionCount === 0) {
          // 该维度没有任何题目涉及，给 0 分
          this.normalizedScores[dim] = 0
        } else {
          const range = stats.max - stats.min
          
          if (range === 0) {
            // 所有涉及题目该维度分值相同
            this.normalizedScores[dim] = 0
          } else {
            // 题目分数线性映射到 [0, 100]
            const mapped = ((stats.actual - stats.min) / range) * 100
            
            // 加上彩蛋分数，上限 100
            const final = mapped + this.eggScores[dim]
            this.normalizedScores[dim] = Math.max(0, Math.min(100, Math.round(final)))
          }
        }
      }
    }
  }
})
