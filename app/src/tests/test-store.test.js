import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTestStore } from '../stores/test'
import { DIMENSION_IDS } from '../data/dimensions'

describe('test store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTestStore()
  })

  describe('startTest', () => {
    it('should reset all state', () => {
      // 修改一些状态
      store.currentStage = 'speed'
      store.hp = 1
      store.dimensionScores.D1 = 10
      store.eggScores.D5 = 5

      store.startTest()

      expect(store.currentStage).toBe('normal')
      expect(store.hp).toBe(3)
      expect(store.currentQuestionIndex).toBe(0)
      expect(store.dimensionScores.D1).toBe(0)
      expect(store.eggScores.D5).toBe(0)
      expect(store._scoredQuestions.size).toBe(0)
      expect(store._triggeredEggKeys.size).toBe(0)
    })
  })

  describe('answerQuestion', () => {
    it('should apply scores correctly', () => {
      // 直接测试_applyQuestionScores
      const q = store.questions.find(q => q.dimensions && Object.keys(q.dimensions).length > 0)
      if (!q) return

      // 找一个选项A分数不为0的维度
      let testDim = null
      for (const [dim, data] of Object.entries(q.dimensions)) {
        if (data.A && data.A !== 0) {
          testDim = dim
          break
        }
      }
      if (!testDim) return

      const scoreBefore = store.dimensionScores[testDim]
      store._applyQuestionScores(q, 'A')

      // 分数应该被修改
      expect(store.dimensionScores[testDim]).not.toBe(scoreBefore)
    })

    it('should not score same question twice', () => {
      const q = store.questions[0]
      store.answerQuestion(q.id, 'A')
      const scoresBefore = { ...store.dimensionScores }

      store.answerQuestion(q.id, 'B')

      expect(store.dimensionScores).toEqual(scoresBefore)
    })

    it('should handle hpCost options', () => {
      // 找一个有hpCost的题目
      const hpQuestion = store.questions.find(q =>
        q.options.some(o => o.hpCost)
      )
      if (!hpQuestion) return // 如果没有hpCost题目则跳过

      const hpOption = hpQuestion.options.find(o => o.hpCost)
      const hpBefore = store.hp

      store.answerQuestion(hpQuestion.id, hpOption.id)

      expect(store.hp).toBeLessThan(hpBefore)
      expect(store._pendingAnswer).toBeTruthy()
      expect(store._scoredQuestions.has(hpQuestion.id)).toBe(true)
    })

    it('should ignore non-existent question', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      store.answerQuestion('NON_EXISTENT', 'A')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('HP system', () => {
    it('should decrease hp on loseHp', () => {
      const hpBefore = store.hp
      store.loseHp(1)

      expect(store.hp).toBe(hpBefore - 1)
      expect(store.showHpLoss).toBe(true)
    })

    it('should not go below 0', () => {
      store.hp = 0
      store.loseHp(1)

      expect(store.hp).toBe(0)
    })

    it('should trigger hpZero when hp reaches 0', () => {
      store.hp = 1
      store.loseHp(1)

      expect(store.hp).toBe(0)
      // hpZero效果应该被触发
    })

    it('should restore hp after hpZero', () => {
      store.hp = 0
      store.showHpZeroEffect = true

      store.dismissHpZero()

      expect(store.hp).toBe(1)
      expect(store.showHpZeroEffect).toBe(false)
      expect(store.foundEggs.hpZero).toBe(true)
    })
  })

  describe('normalizeScores', () => {
    it('should normalize scores to 0-100 range', () => {
      store.startTest()
      store.normalizeScores()

      for (const dim of DIMENSION_IDS) {
        expect(store.normalizedScores[dim]).toBeGreaterThanOrEqual(0)
        expect(store.normalizedScores[dim]).toBeLessThanOrEqual(100)
      }
    })

    it('should handle zero scores', () => {
      store.startTest()
      store.normalizeScores()

      // 没有答题时，actual=0，但eggRange有min/max
      // 归一化结果取决于实际分数在min-max范围内的位置
      for (const dim of DIMENSION_IDS) {
        expect(store.normalizedScores[dim]).toBeDefined()
        expect(typeof store.normalizedScores[dim]).toBe('number')
      }
    })

    it('should handle max scores', () => {
      store.startTest()

      // 为每个维度设置一个高分
      for (const dim of DIMENSION_IDS) {
        store.dimensionScores[dim] = 10
      }

      store.normalizeScores()

      // 分数应该被归一化
      for (const dim of DIMENSION_IDS) {
        expect(store.normalizedScores[dim]).toBeGreaterThanOrEqual(0)
        expect(store.normalizedScores[dim]).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('egg triggers', () => {
    it('should trigger egg after matching question', () => {
      store.startTest()

      // 找到有彩蛋触发的题目
      const { eggTriggers } = require('../data/eggTriggers')
      const trigger = eggTriggers.find(t => t.trigger.afterQuestion)
      if (!trigger) return

      const questionId = trigger.trigger.afterQuestion
      const optionId = trigger.trigger.option || 'A'

      store.answerQuestion(questionId, optionId)

      expect(store.currentStage).toBe(trigger.stage)
    })

    it('should not trigger same egg twice', () => {
      store.startTest()

      const { eggTriggers } = require('../data/eggTriggers')
      const trigger = eggTriggers.find(t => t.trigger.afterQuestion)
      if (!trigger) return

      const questionId = trigger.trigger.afterQuestion
      const optionId = trigger.trigger.option || 'A'

      store.answerQuestion(questionId, optionId)
      store.currentStage = 'normal'
      store.answerQuestion(questionId, optionId)

      // 第二次不应该触发
      expect(store._triggeredEggKeys.size).toBe(1)
    })
  })

  describe('speed questions', () => {
    it('should answer speed question correctly', () => {
      store.startTest()
      store.currentStage = 'speed'
      store.currentSpeedIndex = 0

      const q = store.speedQs[0]
      store.answerSpeedQuestion(q.id, 'A')

      expect(store.currentSpeedIndex).toBe(1)
    })

    it('should handle speed timeout', () => {
      store.startTest()
      store.currentStage = 'speed'
      store.currentSpeedIndex = 0

      const q = store.speedQs[0]
      const d1Before = store.eggScores.D1

      store.handleSpeedTimeout(q.id)

      expect(store.eggScores.D1).toBeLessThan(d1Before)
    })
  })

  describe('invitation egg', () => {
    it('should handle invitation view', () => {
      store.startTest()
      store.currentStage = 'invitation'
      store.showInvitation = true

      store.handleInvitationView(3)

      expect(store.invitationLayer).toBe(2)
    })

    it('should handle invitation ignore', () => {
      store.startTest()
      store.currentStage = 'invitation'
      store.showInvitation = true

      store.handleInvitationIgnore()

      expect(store.currentStage).toBe('normal')
      expect(store.showInvitation).toBe(false)
    })
  })

  describe('binary eggs', () => {
    it('should handle nameEgg found', () => {
      store.startTest()

      store.handleNameEgg(true)

      expect(store.foundEggs.nameEgg).toBe(true)
      expect(store.eggScores.D1).toBeGreaterThan(0)
    })

    it('should handle nameEgg not found', () => {
      store.startTest()

      store.handleNameEgg(false)

      expect(store.foundEggs.nameEgg).toBe(false)
      expect(store.eggScores.D1).toBeLessThan(0)
    })
  })
})
