import { defineStore } from 'pinia'
import { normalQuestions } from '../data/questions'
import { speedQuestions } from '../data/speedQuestions'

export const useTestStore = defineStore('test', {
  state: () => ({
    // 当前阶段: 'start' | 'normal' | 'invitation' | 'invitationLayer2' | 'hiddenTerms' | 'nameEgg' | 'poemEgg' | 'rescueEgg' | '1yuan' | 'speed' | 'result'
    currentStage: 'start',
    
    // 当前题目索引
    currentQuestionIndex: 0,
    currentSpeedIndex: 0,
    
    // 血量系统
    hp: 3,
    maxHp: 3,
    
    // 用户答案记录
    answers: {},
    
    // 15维度原始分
    dimensionScores: {
      D1: 0, D2: 0, D3: 0, D4: 0, D5: 0,
      D6: 0, D7: 0, D8: 0, D9: 0, D10: 0,
      D11: 0, D12: 0, D13: 0, D14: 0, D15: 0
    },
    
    // 15维度归一化分 (0-100)
    normalizedScores: {},
    
    // 题目数据
    questions: normalQuestions,
    speedQs: speedQuestions,
    
    // 速答倒计时
    speedTimer: 0,
    speedTimerInterval: null,
    isSpeedTimerRunning: false,
    
    // 血量扣减动画
    showHpLoss: false,
    hpLossMessage: '',
    hpLossTimer: null,
    hpLossCount: 0,
    
    // 血量清零彩蛋
    showHpZeroEffect: false,
    hpZeroTimer: null,
    
    // 1元测试
    show1YuanTest: false,
    yuanTestStage: 'idle',
    yuanTestClickTime: null,
    
    // 邀请函
    showInvitation: false,
    invitationLayer: 1,
    showInvitationContent: false,
    showHiddenTerms: false,
    invitationClickTime: null,
    hiddenTermsTimer: null,
    
    // 谜题诗
    showPoemPuzzle: false,
    poemSolved: false,
    
    // 广告彩蛋
    showAd: false,
    adTimer: null,
    adCloseTimeout: null,
    adCountdownInterval: null,
    adTextInterval: null,
    
    // 记录彩蛋发现
    foundEggs: {
      nameEgg: false,
      rescueEgg: false,
      adCloseButton: false,
      poemPuzzle: false,
      invitationClose: false,
      hpZero: false,
      validCard: false
    },
    
    // 防止重复nextQuestion
    _pendingHiddenEggStage: null,
    
    // 邀请函是否已经在本轮测试中展示过
    _invitationShown: false
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
    
    displayQuestionNumber: (state) => {
      // 跳过 Q18/Q22/Q24 这类隐藏彩蛋题在标题上显示题号
      const q = state.questions[state.currentQuestionIndex]
      if (q && q.isHiddenEgg) return null
      return state.currentQuestionIndex + 1
    },
    
    totalDisplayQuestions: (state) => {
      return state.questions.filter(q => !q.isHiddenEgg).length
    },
    
    progress: (state) => {
      if (state.currentStage === 'normal') {
        return ((state.currentQuestionIndex + 1) / state.questions.length) * 100
      }
      return 100
    },
    
    hpPercentage: (state) => (state.hp / state.maxHp) * 100
  },
  
  actions: {
    // 开始测试
    startTest() {
      this.currentStage = 'normal'
      this.currentQuestionIndex = 0
      this.currentSpeedIndex = 0
      this.hp = this.maxHp
      this.answers = {}
      this.show1YuanTest = false
      this.showInvitation = false
      this.showPoemPuzzle = false
      this.showAd = false
      this.foundEggs = { nameEgg: false, rescueEgg: false, adCloseButton: false, poemPuzzle: false, invitationClose: false, hpZero: false, validCard: false }
      this._invitationShown = false
      this._pendingHiddenEggStage = null
      this.hpLossCount = 0
      this.resetDimensionScores()
      this.stopSpeedTimer()
      this.clearHpEffects()
    },
    
    clearHpEffects() {
      if (this.hpLossTimer) { clearTimeout(this.hpLossTimer); this.hpLossTimer = null }
      if (this.hpZeroTimer) { clearTimeout(this.hpZeroTimer); this.hpZeroTimer = null }
      this.showHpLoss = false
      this.showHpZeroEffect = false
    },
    
    resetDimensionScores() {
      for (let i = 1; i <= 15; i++) {
        this.dimensionScores[`D${i}`] = 0
      }
    },
    
    // 回答正常题目
    answerQuestion(questionId, optionId) {
      const question = this.questions.find(q => q.id === questionId)
      if (!question) return
      
      this.answers[questionId] = optionId
      
      // 检查血量消耗
      const option = question.options.find(o => o.id === optionId)
      if (option && option.hpCost) {
        this.loseHp(option.hpCost)
      }
      
      // 累加维度分数
      for (const [dim, data] of Object.entries(question.dimensions)) {
        const score = data[optionId] || 0
        const weight = data.weight || 1
        this.dimensionScores[dim] += score * weight
      }
      
      // 检查隐藏题触发
      const hiddenStage = this.checkHiddenTriggers(questionId, optionId)
      if (hiddenStage) {
        this._pendingHiddenEggStage = hiddenStage
        return // 阻止 nextQuestion，让隐藏题接管
      }
      
      // 下一题
      if (this.currentStage === 'normal') {
        this.nextQuestion()
      }
    },
    
    // 检查隐藏题触发（答完当前题后），返回新的stage名称或null
    checkHiddenTriggers(questionId, optionId) {
      // Q16选择B：广告彩蛋（阻止nextQuestion）
      if (questionId === 'Q16' && optionId === 'B') {
        this.currentStage = 'ad'
        this.showAd = true
        return 'ad'
      }
      
      // Q17后：记得名字彩蛋
      if (questionId === 'Q17') {
        this.currentStage = 'nameEgg'
        return 'nameEgg'
      }
      
      // Q21后：谜题诗
      if (questionId === 'Q21') {
        this.currentStage = 'poemEgg'
        this.showPoemPuzzle = true
        return 'poemEgg'
      }
      
      // Q23后：谁救了你
      if (questionId === 'Q23') {
        this.currentStage = 'rescueEgg'
        return 'rescueEgg'
      }
      
      return null
    },
    
    // 在Q3前展示邀请函（题目显示前）
    checkBeforeQuestion() {
      if (!this._invitationShown && this.currentQuestionIndex === 2) { // Q3
        this._invitationShown = true
        this.currentStage = 'invitation'
        this.showInvitation = true
        this.invitationLayer = 1
        this.showInvitationContent = false
        this.showHiddenTerms = false
        return true
      }
      return false
    },
    
    // 邀请函交互
    handleInvitationView(isQuick) {
      this.invitationClickTime = Date.now()
      if (isQuick) {
        this.dimensionScores.D3 += 0.5 * 2
      } else {
        this.dimensionScores.D3 += -0.5 * 2
      }
      this.dimensionScores.D5 += 0.5 * 2
      this.dimensionScores.D8 += 0.3 * 2
      this.dimensionScores.D2 += 0.3 * 1
      this.dimensionScores.D13 += -0.3 * 2
      this.invitationLayer = 2
      this.showInvitationContent = true
    },
    
    handleInvitationIgnore() {
      this.dimensionScores.D5 += -0.5 * 2
      this.dimensionScores.D8 += -0.3 * 2
      this.dimensionScores.D2 += -0.3 * 1
      this.dimensionScores.D13 += 0.5 * 2
      this.showInvitation = false
      this.currentStage = 'normal'
      // 不调用nextQuestion()，因为邀请函是在Q3前展示的
      // 返回后应该显示Q3本身
    },
    
    handleInvitationHiddenTerms(clicked) {
      if (clicked) {
        this.dimensionScores.D1 += 0.8 * 4
        this.dimensionScores.D5 += 0.5 * 2
      } else {
        this.dimensionScores.D8 += 0.5 * 2
        this.dimensionScores.D13 += 0.5 * 2
      }
      // 先关闭邀请函，显示Q3
      this.showInvitation = false
      this.currentStage = 'normal'
      // 不调用nextQuestion()，因为邀请函是在Q3前展示的
    },
    
    // 点击隐藏条款
    handleHiddenTermsClicked() {
      // 显示条款内容
      this.showHiddenTerms = true
      
      // 10秒后自动关闭邀请函进入下一题
      if (this.hiddenTermsTimer) clearTimeout(this.hiddenTermsTimer)
      this.hiddenTermsTimer = setTimeout(() => {
        this.dimensionScores.D1 += 0.8 * 4
        this.dimensionScores.D5 += 0.5 * 2
        this.closeInvitation()
      }, 10000)
    },
    
    // 隐藏条款的隐藏关闭按钮被发现
    handleHiddenTermsCloseButton() {
      this.foundEggs.invitationClose = true
      this.dimensionScores.D1 += 0.8 * 4
      this.dimensionScores.D5 += 0.5 * 2
      this.closeInvitation()
    },

    // 关闭邀请函（未点隐藏条款时）
    closeInvitationWithoutClick() {
      this.dimensionScores.D8 += 0.5 * 2
      this.dimensionScores.D13 += 0.5 * 2
      this.closeInvitation()
    },
    
    closeInvitation() {
      if (this.hiddenTermsTimer) {
        clearTimeout(this.hiddenTermsTimer)
        this.hiddenTermsTimer = null
      }
      this.showInvitation = false
      this.showInvitationContent = false
      this.showHiddenTerms = false
      this.currentStage = 'normal'
      // 不调nextQuestion，因为当前index还是2(Q3)，正常显示Q3
    },
    
    // 记得名字彩蛋
    handleNameEgg(found) {
      if (found) {
        this.foundEggs.nameEgg = true
        this.dimensionScores.D1 += 0.8 * 4
      } else {
        this.dimensionScores.D1 += -0.5 * 4
      }
      this.currentStage = 'normal'
      this._pendingHiddenEggStage = null
      this.nextQuestion()
    },
    
    // 谜题诗
    handlePoemEgg(solved) {
      if (solved) {
        this.foundEggs.poemPuzzle = true
        this.dimensionScores.D1 += 0.8 * 3
        this.dimensionScores.D5 += 0.5 * 3
        this.dimensionScores.D12 += 0.5 * 3
      }
      this.showPoemPuzzle = false
      this.currentStage = 'normal'
      this._pendingHiddenEggStage = null
      this.nextQuestion()
    },
    
    // 谁救了你
    handleRescueEgg(found) {
      if (found) {
        this.foundEggs.rescueEgg = true
        this.dimensionScores.D1 += 0.8 * 4
      } else {
        this.dimensionScores.D1 += -0.5 * 4
      }
      this.currentStage = 'normal'
      this._pendingHiddenEggStage = null
      this.nextQuestion()
    },
    
    // 广告关闭按钮
    handleAdCloseButton() {
      this.foundEggs.adCloseButton = true
      this.dimensionScores.D1 += 0.8 * 4
      this.cleanupAdTimers()
      this.showAd = false
      this.currentStage = 'normal'
      this._pendingHiddenEggStage = null
      this.nextQuestion()
    },
    
    // 广告结束（未发现关闭按钮）
    handleAdEnd() {
      this.cleanupAdTimers()
      this.showAd = false
      // 不调nextQuestion，因为handleAdCloseButton已处理
    },
    
    cleanupAdTimers() {
      if (this.adTextInterval) { clearInterval(this.adTextInterval); this.adTextInterval = null }
      if (this.adCountdownInterval) { clearInterval(this.adCountdownInterval); this.adCountdownInterval = null }
      if (this.adCloseTimeout) { clearTimeout(this.adCloseTimeout); this.adCloseTimeout = null }
    },
    
    // 回答速答题目
    answerSpeedQuestion(questionId, optionId) {
      const question = this.speedQs.find(q => q.id === questionId)
      if (!question) return
      
      this.answers[questionId] = optionId
      
      // 速答题扣血
      const option = question.options.find(o => o.id === optionId)
      if (option && option.hpCost) {
        this.loseHp(option.hpCost)
      }
      
      for (const [dim, data] of Object.entries(question.dimensions)) {
        const score = data[optionId] || 0
        const weight = data.weight || 1
        this.dimensionScores[dim] += score * weight
      }
      
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
      // 防止重复启动
      if (this.isSpeedTimerRunning) return
      
      const question = this.speedQs.find(q => q.id === questionId)
      if (!question) return
      
      this.speedTimer = question.timeLimit
      this.isSpeedTimerRunning = true
      
      this.speedTimerInterval = setInterval(() => {
        this.speedTimer--
        if (this.speedTimer <= 0) {
          this.handleSpeedTimeout(questionId)
        }
      }, 1000)
    },
    
    stopSpeedTimer() {
      if (this.speedTimerInterval) {
        clearInterval(this.speedTimerInterval)
        this.speedTimerInterval = null
      }
      this.isSpeedTimerRunning = false
    },
    
    loseHp(amount = 1) {
      this.clearHpEffects()

      this.hp = Math.max(0, this.hp - amount)
      this.showHpLoss = true
      this.hpLossCount++
    },

    dismissHpLoss() {
      this.showHpLoss = false
      if (this.hp === 0) {
        this.showHpZeroEffect = true
      }
    },

    dismissHpZero() {
      this.foundEggs.hpZero = true
      this.showHpZeroEffect = false
      this.hp = 1
    },
    
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        // 检查是否需要显示隐藏题
        this.checkBeforeQuestion()
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
    
    handle1YuanConfirm(isQuick) {
      this.yuanTestClickTime = Date.now()
      if (isQuick) {
        this.dimensionScores.D3 += 0.8 * 2
        this.dimensionScores.D14 += 0.5 * 2
      } else {
        this.dimensionScores.D3 += -0.5 * 2
        this.dimensionScores.D14 += 0.5 * 2
      }
      this.yuanTestStage = 'input'
    },
    
    handle1YuanCancel(isQuick) {
      if (isQuick) {
        this.dimensionScores.D3 += 0.8 * 2
        this.dimensionScores.D14 += -0.5 * 2
        this.dimensionScores.D8 += -0.5 * 2
      } else {
        this.dimensionScores.D3 += -0.5 * 2
        this.dimensionScores.D14 += -0.5 * 2
        this.dimensionScores.D8 += -0.5 * 2
      }
      this.finish1YuanTest()
    },
    
    handle1YuanInput(hasInput) {
      if (hasInput) {
        this.foundEggs.validCard = true
        this.dimensionScores.D8 += 0.5 * 3
        this.dimensionScores.D14 += 0.8 * 3
        this.dimensionScores.D11 += 0.5 * 3
      } else {
        this.dimensionScores.D8 += 0.5 * 2
        this.dimensionScores.D14 += -0.3 * 2
        this.dimensionScores.D11 += -0.3 * 2
      }
      this.finish1YuanTest()
    },
    
    finish1YuanTest() {
      this.show1YuanTest = false
      this.currentStage = 'result'
      this.normalizeScores()
    },
    
    finishSpeedStage() {
      this.currentStage = '1yuan'
      this.show1YuanTest = true
      this.yuanTestStage = 'confirm'
    },
    
    normalizeScores() {
      const ranges = {
        D1: { min: -6.9, max: 16.7 },
        D2: { min: -4.3, max: 8.9 },
        D3: { min: -1.0, max: 8.8 },
        D4: { min: -7.2, max: 30.4 },
        D5: { min: -0.6, max: 13.1 },
        D6: { min: -8.2, max: 12.2 },
        D7: { min: -12.1, max: 24.6 },
        D8: { min: -11.2, max: 22.2 },
        D9: { min: -15.5, max: 16.0 },
        D10: { min: -10.2, max: 14.1 },
        D11: { min: -7.2, max: 33.1 },
        D12: { min: -7.8, max: 12.1 },
        D13: { min: -3.0, max: 26.5 },
        D14: { min: -7.2, max: 4.0 },
        D15: { min: -10.9, max: 20.8 }
      }
      
      for (const [dim, range] of Object.entries(ranges)) {
        const raw = this.dimensionScores[dim]
        const normalized = ((raw - range.min) / (range.max - range.min)) * 100
        this.normalizedScores[dim] = Math.max(0, Math.min(100, Math.round(normalized)))
      }
    }
  }
})
