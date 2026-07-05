// 彩蛋触发配置表
// trigger.afterQuestion: 答完哪道题后触发
// trigger.option: 必须选哪个选项才触发（不填则任意选项都触发）
// trigger.beforeQuestion: 在哪道题之前触发（用于邀请函）
// stage: 触发后进入的阶段名

export const eggTriggers = [
  {
    id: 'invitation',
    trigger: { beforeQuestion: 'Q3', index: 2 },
    stage: 'invitation'
  },
  {
    id: 'ad',
    trigger: { afterQuestion: 'Q16', option: 'B' },
    stage: 'ad'
  },
  {
    id: 'nameEgg',
    trigger: { afterQuestion: 'Q17' },
    stage: 'nameEgg'
  },
  {
    id: 'poemEgg',
    trigger: { afterQuestion: 'Q20' },
    stage: 'poemEgg'
  },
  {
    id: 'rescueEgg',
    trigger: { afterQuestion: 'Q21' },
    stage: 'rescueEgg'
  }
]
