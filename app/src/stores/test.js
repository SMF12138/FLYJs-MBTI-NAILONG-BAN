import { defineStore } from 'pinia'
import { normalQuestions } from '../data/questions'
import { speedQuestions } from '../data/speedQuestions'
import { eggTriggers } from '../data/eggTriggers'
import { DIMENSION_IDS } from '../data/dimensions'
import { DIMENSION_RANGES } from '../data/dimensionRanges'

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
          console.log('[CHECK BEFORE]', q?.id, '===', trigger.trigger.beforeQuestion, '?', q?.id === trigger.trigger.beforeQuestion)
          if (q && q.id === trigger.trigger.beforeQuestion) {
            const key = `before:${trigger.trigger.beforeQuestion}:${trigger.stage}`
            if (this._triggeredEggKeys.has(key)) { console.log('[SKIP] already triggered'); continue }
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
    handleInvitationView(isQuick) {
      this.invitationClickTime = Date.now()
      this.dimensionScores.D3 += isQuick ? 0.5 * 5 : -0.5 * 5
      this.dimensionScores.D5 += 0.5 * 2
      this.dimensionScores.D8 += 0.3 * 3
      this.dimensionScores.D2 += 0.3 * 3
      this.dimensionScores.D13 += -0.3 * 3
      this.invitationLayer = 2
      this.showInvitationContent = true
    },

    handleInvitationIgnore() {
      this.dimensionScores.D5 += -0.5 * 2
      this.dimensionScores.D8 += -0.3 * 3
      this.dimensionScores.D2 += -0.3 * 3
      this.dimensionScores.D13 += 0.5 * 3
      this.showInvitation = false
      this.currentStage = 'normal'
    },

    handleHiddenTermsClicked() {
      this.foundEggs.invitationTerms = true
      this.showHiddenTerms = true
      this._setTimer('hiddenTerms', () => {
        this.dimensionScores.D1 += 0.8 * 4
        this.dimensionScores.D5 += 0.5 * 2
        this.closeInvitation()
      }, 10000)
    },

    handleHiddenTermsCloseButton() {
      this.foundEggs.invitationClose = true
      this.showHiddenTerms = false
      this._clearTimer('hiddenTerms')
      this.dimensionScores.D1 += 0.8 * 4
      this.dimensionScores.D5 += 0.5 * 2
      this.closeInvitation()
    },

    closeInvitationWithoutClick() {
      this._invitationPath = 'viewNoHidden'
      this.dimensionScores.D8 += 0.5 * 3
      this.dimensionScores.D13 += 0.5 * 3
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
        this.dimensionScores[dim] += score
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
      this.dimensionScores.D1 += 0.8 * 4
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
        this.dimensionScores.D1 += 1
      }
    },

    handleDimClick(dim) {
      if (this.clickedDims[dim]) return
      this.clickedDims[dim] = true
      const count = Object.values(this.clickedDims).filter(v => v).length
      if (count === 15 && !this.foundEggs.dimExplorer) {
        this.foundEggs.dimExplorer = true
        this.dimensionScores.D1 += 1
        this.dimensionScores.D5 += 1
        this.normalizeScores()
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
      this.dimensionScores.D1 -= 0.2
      this.dimensionScores.D3 -= 0.2
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
    handle1YuanConfirm(isQuick) {
      this.dimensionScores.D3 += isQuick ? 0.8 * 5 : -0.5 * 5
      this.dimensionScores.D14 += 0.5 * 4
      this.yuanTestStage = 'input'
    },

    handle1YuanCancel(isQuick) {
      this.dimensionScores.D3 += isQuick ? 0.8 * 5 : -0.5 * 5
      this.dimensionScores.D14 += -0.5 * 4
      this.dimensionScores.D8 += -0.5 * 4
      this.finish1YuanTest()
    },

    handle1YuanInput(hasInput) {
      if (hasInput) {
        this.foundEggs.validCard = true
        this.dimensionScores.D8 += 0.5 * 4
        this.dimensionScores.D14 += 0.8 * 4
        this.dimensionScores.D11 += 0.5 * 3
      } else {
        this.dimensionScores.D8 += 0.5 * 4
        this.dimensionScores.D14 += -0.3 * 4
        this.dimensionScores.D11 += -0.3 * 2
      }
      this.finish1YuanTest()
    },

    finish1YuanTest() {
      this.show1YuanTest = false
      this.currentStage = 'result'
      this.normalizeScores()
    },

    // ─── 分数归一化（raw含所有来源，映射到完整理论范围）───
    normalizeScores() {
      for (const [dim, range] of Object.entries(DIMENSION_RANGES)) {
        const raw = this.dimensionScores[dim]
        const normalized = ((raw - range.min) / (range.max - range.min)) * 100
        this.normalizedScores[dim] = Math.max(0, Math.min(100, Math.round(normalized)))
      }
    }
  }
})
