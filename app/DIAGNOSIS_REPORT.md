# 代码诊断记录

本文件记录了项目开发过程中发现并修复的问题。

## 归一化算法重构 (2026-07-06)

- **重构**：彩蛋/隐藏题/1元测试的理论最大最小纳入归一化范围，所有来源整体映射到 0-100
- **修复**：Q1 的 D5 分值修正（A=0.5 B=0.2 C=0）
- **分离**：彩蛋分数从 `dimensionScores` 独立到 `eggScores`

## 角色前缀补全 (2026-07-06)

- **修复**：VILLAIN_MAP 全部 16 个反派角色补全 `prefix` 字段
- **修复**：`getCharacterByName` 补搜 SPECIAL_HIGH / SPECIAL_LOW
- **优化**：`getAllCharacters` / `getPairing` 返回数据带上 `prefix` 字段

## 其他清理 (2026-07-06)

- 删除无用开发脚本 4 个
- 删除不再使用的 `dimensionRanges.js`
- 移除无用 `DIMENSION_RANGES` import
- 修正"宿世之敌"→"夙世之敌"
