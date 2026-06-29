# 角色人格测试项目

一个基于心理学理论的角色人格测试系统，通过选择题+隐藏彩蛋的方式，测出用户的人格特征并映射到一个诙谐有趣的抽象角色。

## 核心理念

- **专业性**：基于大五人格、认知风格等经典心理学理论
- **趣味性**：结果是具体的角色形象（如"奶龙"），而非抽象的4字母类型
- **互动性**：隐藏彩蛋和特殊互动增加探索乐趣
- **准确性**：通过行为观测+自评结合，提高测量信效度

## 项目结构

```
MBTI-Character-Test/
├── README.md                    # 项目说明
├── docs/
│   ├── theories.md              # 心理学理论参考
│   ├── workflow.md              # 完整工作流设计
│   ├── dimensions.md            # 人格维度定义
│   ├── characters.md            # 角色库设计
│   ├── questions.md             # 题目体系设计
│   └── scoring-rules-revised.md # 评分规则与维度定义
├── app/                         # Vue3前端应用
│   ├── src/
│   │   ├── components/          # Vue组件
│   │   │   ├── StartScreen.vue      # 开始界面
│   │   │   ├── QuestionCard.vue     # 答题卡片
│   │   │   ├── SpeedQuestion.vue    # 速答卡片
│   │   │   ├── OneYuanTest.vue      # 1元测试
│   │   │   ├── InvitationTest.vue   # 邀请函彩蛋
│   │   │   ├── NameEgg.vue          # 名字彩蛋
│   │   │   ├── PoemEgg.vue          # 谜题诗
│   │   │   ├── RescueEgg.vue        # 谁救了你
│   │   │   ├── AdOverlay.vue        # 广告覆盖层
│   │   │   ├── ResultScreen.vue     # 结果展示
│   │   │   ├── RadarChart.vue       # 雷达图
│   │   │   ├── HpBar.vue            # 血条
│   │   │   └── ProgressBar.vue      # 进度条
│   │   ├── data/
│   │   │   ├── questions.js         # 30道正常题目
│   │   │   ├── hiddenQuestions.js   # 隐藏题数据
│   │   │   ├── speedQuestions.js    # 8道速答数据
│   │   │   └── characters.js        # 角色库数据
│   │   ├── stores/
│   │   │   └── test.js              # Pinia状态管理
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   └── package.json
└── package.json
```

## 技术栈

- **前端框架**：Vue 3 + Vite
- **UI框架**：Tailwind CSS
- **状态管理**：Pinia
- **部署方式**：静态文件（可本地运行，也可挂服务器部署）

## 功能特性

### 题目系统
- 30道情境选择题（含故事背景）
- 15维度人格测量
- 血量系统（3滴血，扣血动画）

### 隐藏彩蛋（6个）
1. **邀请函**（Q3前）：查看/扔掉 → 隐藏条款
2. **1元测试**：输入银行卡号测试
3. **记得名字吗**（Q18）：隐藏正确答案"奶龙"
4. **谜题诗**（Q22）：拖动字块排列诗句
5. **谁救了你**（Q24）：隐藏正确答案"王二狗"
6. **广告关闭按钮**（Q16选择B后）

### 速答环节
- 8道限时题目（5-60秒）
- 超时惩罚：D1洞察-0.2，D3谋断-0.2
- 自动选择默认答案

### 结果展示
- 15维度雷达图
- 角色匹配算法（加权余弦相似度）
- 个性化分析文案

## 运行方式

```bash
cd app
npm install
npm run dev
```

访问 http://localhost:5173/

## 项目进度

- [x] 项目初始化
- [x] 理论框架确定（15维度体系）
- [x] 维度设计（D1-D15）
- [x] 角色库设计（5个角色）
- [x] 题目体系设计（30题+6隐藏+8速答）
- [x] 隐藏机制设计
- [x] 评分算法设计
- [x] 原型开发
- [x] UI/UX优化
- [ ] 更多角色设计
- [ ] 音效/动画优化
- [ ] 部署上线
