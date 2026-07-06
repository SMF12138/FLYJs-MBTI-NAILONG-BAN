# 代码诊断记录

本文件记录了项目开发过程中发现并修复的问题。

## 文档清理 (2026-07-06)

- 修复 `simulate_scores.cjs`：移除对已删除 `dimensionRanges.js` 的引用，改用动态计算
- 修复 `test_scores.cjs`：移除对已删除 `dimensionRanges.js` 的引用，使用模拟范围
- 更新 `DIAGNOSIS_REPORT.md`：补充快速操作三档机制记录

## 快速操作三档机制 (2026-07-06)

- **重构**：邀请函/1元测试的 D3 加分从二档改为三档：`<5秒加分 / 5-20秒不变 / >20秒扣分`
- **修复**：传递 elapsed 时间而非 isQuick 布尔值，支持三档判定

## 归一化算法重构 (2026-07-06)

- **重构**：彩蛋/隐藏题/1元测试的理论最大最小纳入归一化范围，所有来源整体映射到 0-100
- **修复**：Q1 的 D5 分值修正（A=0.5 B=0.2 C=0）
- **分离**：彩蛋分数从 `dimensionScores` 独立到 `eggScores`
- **删除**：`dimensionRanges.js` 已删除，min/max 改为题目动态计算

## 角色前缀补全 (2026-07-06)

- **修复**：VILLAIN_MAP 全部 16 个反派角色补全 `prefix` 字段
- **修复**：`getCharacterByName` 补搜 SPECIAL_HIGH / SPECIAL_LOW
- **优化**：`getAllCharacters` / `getPairing` 返回数据带上 `prefix` 字段

## 前情提要渐变色 (2026-07-06)

- **更新**：重点文字添加多色渐变（选择/音量→青色，决定/不打扰→红色，命运/生死/人生→渐变色，200%→紫色）

## 其他清理 (2026-07-06)

- 删除无用开发脚本 4 个
- 删除不再使用的 `dimensionRanges.js`
- 移除无用 `DIMENSION_RANGES` import
- 修正"宿世之敌"→"夙世之敌"
