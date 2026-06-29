// 速答环节数据
export const speedQuestions = [
  // 速答1 (20秒)
  {
    id: 'S1',
    timeLimit: 20,
    title: '杀谁',
    question: '你找到了机会，可以杀死在场一个人的灵魂',
    options: [
      { id: 'A', text: '尔伯，因为我为他牺牲他却背叛了我' },
      { id: 'B', text: '黑手，所有一切因他而起' },
      { id: 'C', text: '小猫，她已被精神控制我要给她解脱' },
      { id: 'D', text: '王二狗，为黑手当狗比黑手本身更邪恶' }
    ],
    defaultAnswer: 'D',
    dimensions: {
      D7: { A: -0.8, B: 0, C: 0.5, D: -0.2, weight: 3 },
      D9: { A: -0.8, B: 0.5, C: 0, D: 0, weight: 2 },
      D6: { A: 0.3, B: 0, C: 0, D: 0, weight: 1 },
      D10: { A: -0.8, B: 0.5, C: 0, D: 0.2, weight: 2 },
      D1: { A: 0, B: 0.5, C: -0.5, D: 0.2, weight: 2 }
    }
  },

  // 速答2 (20秒)
  {
    id: 'S2',
    timeLimit: 20,
    title: '还能回到从前吗',
    question: '小猫被精神控制后已经和王二狗搞在了一起，如果她能解脱控制，你觉得你们还能回到从前吗',
    options: [
      { id: 'A', text: '不能' },
      { id: 'B', text: '能' },
      { id: 'C', text: '我愿意试试' },
      { id: 'D', text: '原来猫狗才是真爱' }
    ],
    defaultAnswer: 'B',
    dimensions: {
      D4: { A: -0.8, B: 0.8, C: 0.3, D: 0.8, weight: 3 },
      D8: { A: -0.5, B: 0.5, C: 0.3, D: 0, weight: 2 },
      D7: { A: -0.3, B: 0.3, C: 0.5, D: 0.5, weight: 2 }
    }
  },

  // 速答3 (20秒)
  {
    id: 'S3',
    timeLimit: 20,
    title: '重来2022',
    question: '假如世界可以重开到2022年，命运不再左右你，你愿意重来吗',
    options: [
      { id: 'A', text: '愿意' },
      { id: 'B', text: '不愿' }
    ],
    defaultAnswer: 'A',
    dimensions: {
      D13: { A: -0.3, B: 0.5, weight: 2 },
      D12: { A: -0.3, B: 0.5, weight: 2 },
      D4: { A: 0.3, B: 0.5, weight: 2 },
      D5: { A: 0.5, B: -0.3, weight: 2 }
    }
  },

  // 速答4 (20秒)
  {
    id: 'S4',
    timeLimit: 20,
    title: '选李白',
    question: '假如真的重来，你会选李白吗',
    options: [
      { id: 'A', text: '何意味' },
      { id: 'B', text: '我会选李白' },
      { id: 'C', text: '我不会选李白' }
    ],
    defaultAnswer: 'A',
    dimensions: {
      D13: { A: 0, B: 0.5, C: 0, weight: 2 },
      D5: { A: 0, B: 0.5, C: -0.3, weight: 2 },
      D12: { A: 0, B: -0.3, C: 0.3, weight: 1 },
      D6: { A: 0, B: 0, C: 0.5, weight: 1 }
    }
  },

  // 速答5 (5秒)
  {
    id: 'S5',
    timeLimit: 5,
    title: '幸福人生',
    question: '你拥有绝对幸福的人生吗',
    options: [
      { id: 'A', text: '是的' },
      { id: 'B', text: '并不' }
    ],
    defaultAnswer: 'B',
    dimensions: {
      D4: { A: 0.9, B: 0.1, weight: 4 },
      D13: { A: 0.9, B: 0.1, weight: 2 },
      D8: { A: 0.8, B: 0.2, weight: 2 },
      D10: { A: 1.0, B: 0, weight: 1 },
      D14: { A: -1.0, B: 0, weight: 1 },
      D6: { A: -0.8, B: 0.8, weight: 2 }
    }
  },

  // 速答6 (60秒)
  {
    id: 'S6',
    timeLimit: 60,
    title: '二叉树题',
    question: '对于任意一颗高度为5且有10个结点的二叉树，若采用顺序存储结构，每个节点占一个存储单元，则存放该二叉树需要的存储单元数量至少是',
    options: [
      { id: 'A', text: '31' },
      { id: 'B', text: '16' },
      { id: 'C', text: '15' },
      { id: 'D', text: '这傻卵说什么呢' }
    ],
    defaultAnswer: 'D',
    dimensions: {
      D5: { A: 0.3, B: 0, C: 0, D: 0, weight: 2 },
      D11: { A: 0.3, B: 0, C: 0, D: 0, weight: 1 },
      D1: { A: 0.5, B: 0, C: 0, D: -0.3, weight: 3 },
      D3: { A: 0.5, B: 0, C: 0, D: 0, weight: 2 }
    }
  },

  // 速答7 (5秒)
  {
    id: 'S7',
    timeLimit: 5,
    title: '再给一次机会',
    question: '假如上天再给你一次机会，你能抓住吗',
    options: [
      { id: 'A', text: '能' },
      { id: 'B', text: '我不知道' }
    ],
    defaultAnswer: 'B',
    dimensions: {
      D11: { A: 1.0, B: 0, weight: 3 },
      D4: { A: 0.9, B: 0.2, weight: 2 },
      D8: { A: 0.9, B: 0.1, weight: 2 },
      D3: { A: 1.0, B: 0, weight: 2 }
    }
  },

  // 速答8 (5秒) - 权重是速答5的两倍
  {
    id: 'S8',
    timeLimit: 5,
    title: '幸福人生(最终)',
    question: '你将会拥有绝对幸福的人生吗',
    options: [
      { id: 'A', text: '是的' },
      { id: 'B', text: '并不' }
    ],
    defaultAnswer: 'B',
    dimensions: {
      D4: { A: 0.9, B: 0.1, weight: 8 },
      D13: { A: 0.9, B: 0.1, weight: 4 },
      D8: { A: 0.8, B: 0.2, weight: 4 },
      D10: { A: 1.0, B: 0, weight: 2 },
      D14: { A: -1.0, B: 0, weight: 2 },
      D6: { A: -0.8, B: 0.8, weight: 4 }
    }
  }
]

export default speedQuestions
