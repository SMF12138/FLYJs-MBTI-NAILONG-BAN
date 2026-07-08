# 项目诊断报告 — MBTI-Character-Test

> 诊断时间: 2026-07-08 10:38 CST  
> 诊断范围: 构建、测试、代码结构、依赖、潜在风险

---

## 1. ✅ 核心健康指标

| 项目 | 状态 | 备注 |
|------|------|------|
| **构建** | ✅ 通过 | Vite 8.1.0, 18.5s/1.3s (冷/热), 46 modules, 302KB JS + 46KB CSS |
| **单元测试** | ✅ 通过 | 1 test file, 2 tests passed, 1.57s |
| **Git 状态** | ✅ 干净 | 无未提交修改 |
| **全局错误边界** | ✅ 有 | `app.config.errorHandler` 防止白屏 |

## 2. ⚠️ 发现的问题

### 2.1 测试覆盖严重不足

- **源文件 24 个**，测试文件**仅 1 个**（`archetypes.test.js`，2 个用例）
- 核心逻辑文件无测试覆盖：
  - `stores/test.js` — 整个状态管理（答题计分、HP、归一化、彩蛋逻辑）
  - `data/dimensions.js` — 维度定义
  - `data/questions.js` / `data/speedQuestions.js` — 题目数据
  - 所有组件无测试
- **风险**: 归一化算法、彩蛋计分等复杂逻辑改动后无回归保障，手动测试成本高

### 2.2 依赖风险

- 有测试依赖但**无覆盖率工具**：`vitest` 已配但 `@vitest/coverage-v8` 未装
- `npm outdated` 超时（registry 不可达），无法判断依赖版本新鲜度
- 无 lockfile 完整性校验

### 2.3 构建产物较大

- `dist/` 静态文件 349KB（JS 302KB + CSS 46KB + HTML 1KB）
- 无代码分割/懒加载，所有组件打包在一个 chunk 中
- 可优化：`AdOverlay`, `ResultScreen`, `InvitationTest`, 彩蛋组件可按路由/阶段懒加载

### 2.4 静态资源/图标

- 项目使用 SVG 内联图标，无外部图片/字体文件，这是好事
- 但 `public/` 目录是否存在 favicon？前端无 `link[rel=icon]` 的话浏览器会有 404 请求

### 2.5 代码潜在问题

#### 2.5.1 Timer 管理 — `_setTimer` 和 `_setInterval` 共用同一存储

`stores/test.js` 中 `_clearTimer` 同时调用了 `clearTimeout` 和 `clearInterval`，但有个问题：

```js
_clearTimer(name) {
  if (this._timers[name]) {
    clearTimeout(this._timers[name])
    clearInterval(this._timers[name])  // 同时清两种
    delete this._timers[name]
  }
}
```

当前实现中 `_setTimer` 和 `_setInterval` 用同一个存储，如果一个名字先被 `_setTimer` 设了 timeout，后来又被 `_setInterval` 覆写，clear 时两种都调用一次——实际上 `clearTimeout(id)` 对 interval id 是静默无效的（反之亦然），所以**不会造成 bug**，但设计上有混淆的可能。

建议：加类型标记或分两个 map。

#### 2.5.2 彩蛋归一化中的 eggRange 硬编码

`normalizeScores()` 方法中 `eggRange` 是手动维护的，与各个彩蛋处理函数（`handleInvitationView`, `handlePoemEgg` 等）中的分数**重复定义**。一旦某处改分，另一处容易忘改，导致归一化偏差。

建议：官方确定彩蛋分数定义只维护一份。

#### 2.5.3 粒子动画动画属性重复

`App.vue` 模板中粒子元素的 `style` 同时设置了 `animation` 和 `animationDuration/animationDelay`，后者被前者覆盖无效。

```html
:style="{
  animation: `particle-float ${p.duration}s ...`,  // 覆盖了下面的
  animationDuration: p.duration + 's',              // 无效
  animationDelay: p.delay + 's'                     // 无效
}"
```

`animation` 简写属性会覆盖 `animation-duration` 和 `animation-delay` 单独设置。建议只用 `animation` 简写。

#### 2.5.4 `handleSpeedTimeout` 重复标记

`handleSpeedTimeout` 中调用 `answerSpeedQuestion`，而 `answerSpeedQuestion` 内又调了一次 `this._scoredQuestions.add(questionId)`——这会在超时自动回答时额外加回被 `handleSpeedTimeout` 中 `this.eggScores.D1 -= 0.2` 减掉的分。实际看到代码流程：

1. `handleSpeedTimeout` → 扣 eggScores → 调 `answerSpeedQuestion` → 它在开头就 `if (this._scoredQuestions.has(questionId)) return` 

但 `_scoredQuestions` 是在**用户手动回答**时加入的；如果超时触发前用户没答过，不会跳过，继续执行 `_applyQuestionScores`。所以超时处理实际上会：
- 扣 eggScores
- 正常 applyQuestionScores（用 defaultAnswer）

这符合设计预期（超时是 penalty 但题目分照常），所以**不是 bug**。但建议加注释明确。

#### 2.5.5 `startTest()` 遗漏重置

`startTest()` 未重置 `_scoredQuestions` 的类型为 `new Set()`（已存在），但也没有重置 `eggScores`（也已存在）。检查发现这些都有做，OK。

但 `currentStage === 'result'` 时重复点击"重新测试"需要确认不会残留 timer 引用。

## 3. 改进建议

| 优先级 | 建议 | 影响 |
|--------|------|------|
| **P0** | 增加核心逻辑测试 (`stores/test.js` 计分/归一化/HP) | 回归保障 |
| **P1** | 安装 `@vitest/coverage-v8` 并配置覆盖率阈值 | 质量门禁 |
| **P1** | 修复粒子动画 style 冗余（`animation` 简写覆盖了零散属性） | 消除误导 |
| **P2** | 彩蛋分数集中定义，消除 `normalizeScores` 中的双重硬编码 | 可维护性 |
| **P2** | Timer 管理分拆 `_setTimeout`/`_setInterval` 两个 map | 清晰性 |
| **P2** | 添加路由懒加载或异步组件，拆分大 chunk | 首屏性能 |
| **P3** | 添加 favicon，消除浏览器 404 | 用户体验 |
| **P3** | 添加 `npm run test:coverage` 脚本 | 开发体验 |
| **P3** | 确认 CI/CD 中 `npm ci` 而非 `npm install` | 构建一致性 |

## 4. 结论

**总体评分: B-（良好但需加强）**

项目运行正常，构建通过，测试有但有等于无——核心状态管理（240+ 行的 `test.js`）零测试覆盖是最大的风险点。彩蛋计分的手工维护和组件层缺乏隔离也给后续迭代埋下了坑。

建议下次迭代前先把核心逻辑测起来，至少覆盖：
1. 答题计分 + HP 扣减流程
2. 归一化算法正确性（多种场景）
3. 彩蛋触发 + 彩蛋计分的边界