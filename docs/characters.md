# 角色库设计

## 角色分类

| 类型 | 数量 | 解锁方式 | 说明 |
|------|------|----------|------|
| 普通角色 | 12-15个 | 直接匹配 | 基础角色池 |
| 隐藏角色 | 3-5个 | 彩蛋解锁 | 需要发现隐藏机制 |
| 特殊角色 | 1-2个 | 极端得分 | 某维度极端值触发 |

---

## 角色模板

```json
{
  "id": "string",
  "name": "string",
  "title": "string（称号）",
  "category": "normal | hidden | special",
  "description": "一句话人设",
  "personality": "2-3句性格描述",
  "value_type": "共情者 | 自我者 | 混合型",
  "traits": {
    "D1_insight": "0-1浮点数",
    "D2_social": "0-1浮点数",
    "D3_decision": "0-1浮点数",
    "D4_emotion": "0-1浮点数",
    "D5_explore": "0-1浮点数",
    "D6_esteem": "0-1浮点数",
    "D7_compassion": "0-1浮点数",
    "D8_trust": "0-1浮点数",
    "D9_moral": "0-1浮点数",
    "D10_benevolence": "0-1浮点数",
    "D11_courage": "0-1浮点数",
    "D12_consistency": "0-1浮点数",
    "D13_freedom": "0-1浮点数",
    "D14_greed": "0-1浮点数"
  },
  "weights": {
    "D1_insight": "权重（默认1.0）",
    "D2_social": "权重",
    "D3_decision": "权重",
    "D4_emotion": "权重",
    "D5_explore": "权重",
    "D6_esteem": "权重",
    "D7_compassion": "权重",
    "D8_trust": "权重",
    "D9_moral": "权重",
    "D10_benevolence": "权重",
    "D11_courage": "权重",
    "D12_consistency": "权重",
    "D13_freedom": "权重",
    "D14_greed": "权重"
  },
  "analysis_template": "结果分析文案模板，支持{user_name}等变量",
  "image": "角色图片路径",
  "unlock_condition": "解锁条件（仅隐藏角色）"
}
```

---

## 核心角色草案

### 1. 奶龙 (Nailong)

```json
{
  "id": "nailong",
  "name": "奶龙",
  "title": "躺平界扛把子",
  "category": "normal",
  "description": "一只看起来什么都不在乎的小龙，其实什么都记得",
  "personality": "表面云淡风轻，实则内心细腻。对喜欢的事物会突然认真，但只认真三秒钟。记仇但不报仇，因为懒得动。",
  "value_type": "混合型——表面自我中心，实则对在乎的人很慷慨",
  "traits": {
    "D1_insight": 0.4,
    "D2_social": 0.3,
    "D3_decision": 0.6,
    "D4_emotion": 0.7,
    "D5_explore": 0.4,
    "D6_esteem": 0.2,
    "D7_compassion": 0.6,
    "D8_trust": 0.6,
    "D9_moral": 0.4,
    "D10_benevolence": 0.5,
    "D11_courage": 0.3,
    "D12_consistency": 0.4,
    "D13_freedom": 0.8,
    "D14_greed": 0.2
  },
  "weights": {
    "D1_insight": 0.8,
    "D2_social": 1.2,
    "D3_decision": 0.6,
    "D4_emotion": 1.5,
    "D5_explore": 0.5,
    "D6_esteem": 0.8,
    "D7_compassion": 0.9,
    "D8_trust": 0.9,
    "D9_moral": 0.7,
    "D10_benevolence": 0.8,
    "D11_courage": 0.6,
    "D12_consistency": 0.7,
    "D13_freedom": 1.3,
    "D14_greed": 0.8
  },
  "analysis_template": "你和奶龙一样，表面看起来云淡风轻，好像什么都不在乎。但其实你心里都记得，只是懒得计较。你的快乐阈值很低，一件小事就能开心很久，但三分钟后就会忘记自己为什么开心。别人以为你佛系，其实你只是觉得...算了，不重要。",
  "image": "assets/characters/nailong.png"
}
```

---

## 待补充角色

- 卷王（自律狂魔，奋斗型人格）
- 神经刀（毒舌但真诚，洞察型人格）
- 氛围组（社交达人，快乐传染源）
- 像素眼（隐藏角色，细节终结者）
- 摸鱼大师
- 社恐但可爱
- 理性怪
- 感性怪
- 冷笑话王
- 荒诞派
- 其他（根据后续设计补充）

---

## 角色平衡检查

每个维度上应该有足够的角色覆盖：

| 维度 | 低分代表 | 中间值代表 | 高分代表 |
|------|----------|------------|----------|
| D1 洞察 | 奶龙 | - | 待补充 |
| D2 寡合 | 奶龙 | - | 待补充 |
| D3 谋断 | 待补充 | 奶龙 | 待补充 |
| D4 悲欢 | 待补充 | 奶龙 | 待补充 |
| D5 创造 | 奶龙 | - | 待补充 |
| D6 荣辱 | 奶龙 | - | 待补充 |
| D7 恻隐 | 待补充 | 奶龙 | 待补充 |
| D8 信疑 | 待补充 | 奶龙 | 待补充 |
| D9 是非 | 待补充 | 奶龙 | 待补充 |
| D10 羞恶 | 待补充 | 奶龙 | 待补充 |
| D11 勇懦 | 奶龙 | - | 待补充 |
| D12 恒变 | 待补充 | 奶龙 | 待补充 |
| D13 逍遥 | 待补充 | - | 奶龙 |
| D14 贪舍 | 奶龙 | - | 待补充 |
