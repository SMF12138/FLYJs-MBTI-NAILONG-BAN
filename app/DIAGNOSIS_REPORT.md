# MBTI-Character-Test 深度代码诊断报告

> 诊断时间: 2026-07-05
> 项目路径: `D:\风不死\编码\Code\Mimo\MBTI-Character-Test\app`
> 诊断范围: Vue3 + Pinia 单页应用，17个组件 + 1个Store

---

## 执行摘要

| 指标 | 结果 |
|------|------|
| 依赖漏洞 | ✅ 0 vulnerabilities (npm audit) |
| ESLint配置 | ❌ 未配置 |
| 高危问题 | **4个** |
| 中危问题 | **7个** |
| 低危/优化 | **6个** |
| 已修复验证 | **4/4** 之前的问题已修复 |

---

## Phase 1 — 反馈回路建立

### 1.1 依赖安全审计
```bash
$ npm audit
found 0 vulnerabilities
```
✅ **通过** — 无已知安全漏洞

### 1.2 静态代码检查
```bash
$ npx eslint --ext .js,.vue .
# 失败: 未找到 eslint.config.(js|mjs|cjs) 文件
```
❌ **未配置** — 项目缺少 ESLint 配置，建议添加 `eslint.config.js`

### 1.3 代码模式扫描结果

扫描了 17 个 `.vue` 组件和 8 个 `.js` 文件，发现以下模式：

| 模式 | 数量 | 状态 |
|------|------|------|
| `onUnmounted` 使用 | 8个组件 | 部分不完整 |
| `setTimeout/setInterval` | 多处 | 部分无清理 |
| `new Audio()` | 5个组件 | 部分有泄漏风险 |
| `window.addEventListener` | 1处 | ✅ 有清理 |
| `localStorage` 访问 | 1处 | ✅ 正常 |

---

## Phase 2 — 复现验证（之前修复的4个问题）

### 2.1 AdOverlay.vue — 音频泄漏修复 ✅

**状态: 已修复**

```javascript
// 修复内容确认:
const activeAudios = ref([])           // 追踪活跃音频
const pendingTextTimeouts = new Set()   // 追踪文字超时
const adStartTimeouts = []              // 追踪启动超时

onUnmounted(() => {
  if (textInterval) clearInterval(textInterval)
  if (countdownInterval) clearInterval(countdownInterval)
  adStartTimeouts.forEach(tid => clearTimeout(tid))     // ✅ 清理启动超时
  adStartTimeouts.length = 0
  pendingTextTimeouts.forEach(tid => clearTimeout(tid)) // ✅ 清理文字超时
  pendingTextTimeouts.clear()
  stopAllAudio()                                         // ✅ 停止所有音频
})
```

**验证结果**: 所有音频和定时器都有清理逻辑。

### 2.2 NameEgg.vue — 音频清理修复 ✅

**状态: 已修复**

```javascript
onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
})

const handleSelect = (id) => {
  if (audio) {
    audio.pause()
    audio.src = ''      // ✅ 选择后立即清理
    audio = null
  }
  // ...
}
```

### 2.3 ResultScreen.vue — 结束流程定时器修复 ✅

**状态: 已修复**

```javascript
let endTimers = []
let bgm = null

onUnmounted(() => {
  endTimers.forEach(t => clearTimeout(t))  // ✅ 清理所有结束定时器
  if (bgm) { bgm.pause(); bgm.src = '' }   // ✅ 清理BGM
})
```

### 2.4 HpZeroOverlay.vue — 音频泄漏检查 ✅

**状态: 已修复**

```javascript
onUnmounted(() => {
  if (hpZeroAudio) {
    hpZeroAudio.pause()
    hpZeroAudio.src = ''
    hpZeroAudio = null
  }
})
```

---

## Phase 3 — 优化假设（3-5个可验证假设）

### 假设 1: HpLossOverlay.vue 存在定时器泄漏
**可证伪**: 如果组件在3.6秒动画完成前被卸载，`setTimeout` 回调仍会执行。

### 假设 2: App.vue 粒子系统有内存累积风险
**可证伪**: `particles` 数组在极端情况下可能累积，虽然有过期清理，但快速切换可能导致瞬时内存峰值。

### 假设 3: PoemEgg.vue 打字机定时器在阶段切换时可能泄漏
**可证伪**: 虽然 `watch` 和 `onUnmounted` 有清理，但快速切换阶段时 `typeTimer` 可能未被清理。

### 假设 4: Store 中 `_scoredQuestions` 在重新测试时不重置
**可证伪**: `startTest()` 中已重置 `_scoredQuestions = new Set()`，但需验证是否完全清空。

### 假设 5: ResultScreen.vue 中 `snapshotScores` 是浅拷贝，可能受后续 mutations 影响
**可证伪**: `const snapshotScores = { ...store.normalizedScores }` 是浅拷贝，如果 `normalizedScores` 内部有嵌套对象会被共享。

---

## Phase 4 — 探针验证

### 4.1 onUnmounted 清理完整性检查

| 组件 | onUnmounted | 状态 | 问题 |
|------|-------------|------|------|
| App.vue | ✅ 清理 interval + timeouts + eventListener | 完整 | 无 |
| AdOverlay.vue | ✅ 清理所有 interval/timeout/audio | 完整 | 无 |
| NameEgg.vue | ✅ 清理 audio | 完整 | 无 |
| HpZeroOverlay.vue | ✅ 清理 audio | 完整 | 无 |
| ResultScreen.vue | ✅ 清理 timers + bgm | 完整 | 无 |
| OneYuanTest.vue | ✅ 清理 prankTimeout | 完整 | 无 |
| PoemEgg.vue | ✅ 清理 typeTimer + audio | 完整 | 无 |
| **HpLossOverlay.vue** | ❌ **无 onUnmounted** | **缺失** | **🔴 高危** |

### 4.2 定时器/Interval 泄漏风险检查

| 位置 | 定时器类型 | 是否有清理 | 风险等级 |
|------|-----------|-----------|---------|
| App.vue `createParticle` | setTimeout | ✅ pendingTimeouts | 低 |
| AdOverlay.vue `generateText` | setInterval | ✅ | 低 |
| AdOverlay.vue `countdown` | setInterval | ✅ | 低 |
| **HpLossOverlay.vue `phase` 切换** | **setTimeout x3** | **❌ 无清理** | **🔴 高危** |
| ResultScreen.vue `startEnding` | setTimeout x5 | ✅ endTimers | 低 |
| PoemEgg.vue `startTypewriter` | setInterval | ✅ typeTimer | 中 |
| PoemEgg.vue `playGlowEffect` | setTimeout x50 | ❌ 无清理 | 🟡 中危 |
| OneYuanTest.vue `handleInput` | setTimeout | ✅ prankTimeout | 低 |
| **SpeedQuestion.vue `onMounted`** | **store.startSpeedTimer** | **Store管理** | **🟡 中危** |

### 4.3 错误处理检查

| 位置 | 错误处理 | 状态 |
|------|---------|------|
| Audio.play() | `.catch(() => {})` | ✅ 静默处理 |
| Store actions | `console.warn` | 🟡 仅警告 |
| **QuestionCard.vue `handleSelect`** | **无错误边界** | **🟡 中危** |
| **SpeedQuestion.vue `handleSelect`** | **无错误边界** | **🟡 中危** |

---

## Phase 5 — 终极报告

### 🔴 高危问题 (4个)

#### H1: HpLossOverlay.vue 无 onUnmounted 清理 — 定时器泄漏
- **位置**: `src/components/HpLossOverlay.vue`
- **具体代码**:
```javascript
onMounted(() => {
  setTimeout(() => { phase.value = 1 }, 400)   // 无引用
  setTimeout(() => { phase.value = 2 }, 2000)  // 无引用
  setTimeout(() => { phase.value = 3 }, 3600)  // 无引用
})
// ❌ 无 onUnmounted
```
- **影响**: 组件卸载后定时器仍执行，可能导致状态更新到已卸载组件
- **修复方案**:
```javascript
import { onMounted, onUnmounted } from 'vue'
let timers = []

onMounted(() => {
  timers = [
    setTimeout(() => { phase.value = 1 }, 400),
    setTimeout(() => { phase.value = 2 }, 2000),
    setTimeout(() => { phase.value = 3 }, 3600)
  ]
})

onUnmounted(() => {
  timers.forEach(t => clearTimeout(t))
})
```
- **优先级**: P0 — 立即修复

#### H2: PoemEgg.vue `playGlowEffect` 中 50 个 setTimeout 无清理
- **位置**: `src/components/PoemEgg.vue:playGlowEffect()`
- **具体代码**:
```javascript
for (let i = 0; i < 50; i++) {
  setTimeout(() => {
    particles.value.push({...})
  }, i * 30)
}
```
- **影响**: 组件卸载后粒子定时器仍执行，内存泄漏
- **修复方案**: 使用 `pendingTimeouts` Set 追踪并清理
- **优先级**: P1

#### H3: Store 中 `handleHiddenTermsCloseButton` 重复定义
- **位置**: `src/stores/test.js`
- **具体代码**:
```javascript
// 第1次定义 (约第200行)
handleHiddenTermsCloseButton() { ... }

// 第2次定义 (约第215行) — 重复！
handleHiddenTermsCloseButton() { ... }
```
- **影响**: 后定义覆盖前定义，可能导致逻辑不一致；JS 不报错但行为不可预期
- **修复方案**: 删除重复定义，合并逻辑
- **优先级**: P1

#### H4: ResultScreen.vue `snapshotScores` 浅拷贝风险
- **位置**: `src/components/ResultScreen.vue`
- **具体代码**:
```javascript
const snapshotScores = { ...store.normalizedScores }
```
- **影响**: `normalizedScores` 值为原始类型（number），当前无问题；但如果未来改为对象结构，会导致共享引用
- **修复方案**: 添加注释说明或使用深拷贝
- **优先级**: P2

---

### 🟡 中危问题 (7个)

#### M1: SpeedQuestion.vue 速答定时器在组件卸载时未停止
- **位置**: `src/components/SpeedQuestion.vue:onMounted`
- **问题**: `onMounted` 启动定时器，但无 `onUnmounted` 停止
- **影响**: 用户快速切换题目时，旧定时器仍在运行
- **修复**: 添加 `onUnmounted(() => store.stopSpeedTimer())`
- **优先级**: P1

#### M2: QuestionCard.vue / SpeedQuestion.vue 无错误边界
- **位置**: 多个组件的 `handleSelect`
- **问题**: 用户点击后如果 emit 失败或 store 方法抛出异常，无捕获
- **修复**: 添加 try-catch 或 Vue 错误边界
- **优先级**: P2

#### M3: App.vue 粒子系统 `MAX_PARTICLES` 限制但无硬上限保护
- **位置**: `src/App.vue`
- **问题**: `createParticle` 检查 `>= MAX_PARTICLES` 但 interval 300ms 可能在高频场景下累积
- **修复**: 添加更严格的内存保护
- **优先级**: P2

#### M4: PoemEgg.vue 音频对象在模块级别创建
- **位置**: `src/components/PoemEgg.vue`
- **具体代码**:
```javascript
const introAudio = new Audio('/poem-intro.wav')  // 模块级
const readAudio = new Audio('/poem-read.wav')      // 模块级
```
- **影响**: 组件未挂载时音频对象已存在，浪费内存
- **修复**: 移到 `onMounted` 中创建
- **优先级**: P2

#### M5: AdOverlay.vue `adStartTimeouts` 使用普通数组而非 Set
- **位置**: `src/components/AdOverlay.vue`
- **问题**: 使用数组 `adStartTimeouts` 而非响应式 Set，如果组件快速挂载/卸载可能累积
- **修复**: 改为 `ref(new Set())`
- **优先级**: P3

#### M6: ResultScreen.vue `startEnding` 中 BGM 无错误处理
- **位置**: `src/components/ResultScreen.vue`
- **具体代码**:
```javascript
bgm = new Audio('/the-past.mp3')
bgm.play().catch(() => {})  // ✅ 有 catch
```
- **问题**: 如果音频文件不存在，无用户反馈
- **修复**: 添加加载失败提示
- **优先级**: P3

#### M7: Store 中 `checkBeforeQuestion` 有调试日志未清理
- **位置**: `src/stores/test.js`
- **具体代码**:
```javascript
console.log('[CHECK BEFORE]', q?.id, '===', trigger.trigger.beforeQuestion, '?', q?.id === trigger.trigger.beforeQuestion)
console.log('[SKIP] already triggered')
```
- **影响**: 生产环境输出调试日志
- **修复**: 删除或改为条件编译
- **优先级**: P3

---

### 🟢 低危/优化问题 (6个)

#### L1: ESLint 未配置
- **建议**: 添加 `eslint.config.js` 配置 Vue3 规则
- **优先级**: P3

#### L2: 缺少 TypeScript 类型定义
- **建议**: 为 Store state 和组件 props 添加 JSDoc 类型注释
- **优先级**: P4

#### L3: `Math.random()` 用于 ID 生成不安全
- **位置**: 多处使用 `Date.now() + Math.random()`
- **建议**: 使用 `crypto.randomUUID()` 或自增 ID
- **优先级**: P4

#### L4: 全局样式可能冲突
- **位置**: 多个组件定义 `@keyframes` 同名动画
- **建议**: 使用 scoped 或命名空间前缀
- **优先级**: P4

#### L5: `localStorage` 访问无 try-catch
- **位置**: `ResultScreen.vue`
- **问题**: 隐私模式下可能抛出异常
- **修复**: 添加 try-catch
- **优先级**: P3

#### L6: 组件文件过大
- **位置**: `ResultScreen.vue` (500+ 行)
- **建议**: 拆分为子组件（CreditsSection, ReferencesSection 等）
- **优先级**: P4

---

## 修复优先级矩阵

| 优先级 | 问题 | 预计工作量 |
|--------|------|-----------|
| P0 | H1: HpLossOverlay onUnmounted | 5分钟 |
| P1 | H2: PoemEgg 粒子定时器 | 10分钟 |
| P1 | H3: Store 重复方法定义 | 5分钟 |
| P1 | M1: SpeedQuestion 定时器清理 | 5分钟 |
| P2 | H4: snapshotScores 深拷贝 | 5分钟 |
| P2 | M4: PoemEgg 音频模块级创建 | 10分钟 |
| P2 | M2: 错误边界 | 20分钟 |
| P3 | M5-M7, L1, L5 | 各5-10分钟 |
| P4 | L2-L4, L6 | 长期优化 |

---

## 总结

### 已验证修复 ✅
1. AdOverlay.vue — 音频泄漏已修复
2. NameEgg.vue — 音频清理已修复
3. ResultScreen.vue — 结束流程定时器已修复
4. HpZeroOverlay.vue — 音频泄漏已修复

### 新发现高危问题 🔴
1. **HpLossOverlay.vue 无 onUnmounted** — 定时器泄漏
2. **PoemEgg.vue 50个 setTimeout 无清理** — 粒子特效内存泄漏
3. **Store 重复方法定义** — 代码逻辑冲突
4. **SpeedQuestion.vue 定时器未在卸载时停止**

### 建议行动
1. **立即修复 H1** (5分钟)
2. **今日内修复 H2, H3, M1** (20分钟)
3. **本周内添加 ESLint 配置**
4. **长期考虑 TypeScript 迁移**
