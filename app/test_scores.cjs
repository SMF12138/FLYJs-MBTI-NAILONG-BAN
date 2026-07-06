// 模拟一次完整游戏的得分，验证归一化是否合理
const { classifyArchetype, getPairing, getAllCharacters } = require('./src/data/archetypes.js');

// 模拟正常答题得分（假设用户答了所有正常题，选择了中等偏高的选项）
const rawScores = {
  D1: 8, D2: 5, D3: 6, D4: 15, D5: 12,
  D6: 8, D7: 25, D8: 18, D9: 10, D10: 12,
  D11: 30, D12: 15, D13: 20, D14: 8, D15: 20
};

console.log('=== 模拟得分测试 ===');
console.log('\n1. 原始分数:');
for (const [dim, raw] of Object.entries(rawScores)) {
  console.log(`  ${dim}: ${raw}`);
}

console.log('\n2. 归一化后分数（使用模拟范围）:');
const normalized = {};
// 模拟动态范围（与实际归一化逻辑一致）
const simulatedRanges = {
  D1: { min: -7.5, max: 25 }, D2: { min: -5.9, max: 20 }, D3: { min: -3.7, max: 16 },
  D4: { min: -14.8, max: 50 }, D5: { min: -2.2, max: 30 }, D6: { min: -15.9, max: 35 },
  D7: { min: -20.0, max: 60 }, D8: { min: -16.4, max: 40 }, D9: { min: -17.5, max: 30 },
  D10: { min: -15.2, max: 35 }, D11: { min: -18.8, max: 55 }, D12: { min: -17.5, max: 40 },
  D13: { min: -11.3, max: 45 }, D14: { min: -17.2, max: 25 }, D15: { min: -17.0, max: 45 }
};
for (const [dim, range] of Object.entries(simulatedRanges)) {
  const raw = rawScores[dim] || 0;
  const norm = ((raw - range.min) / (range.max - range.min)) * 100;
  normalized[dim] = Math.round(Math.max(0, Math.min(100, norm)));
  console.log(`  ${dim}: ${normalized[dim]}% (raw=${raw}, range=[${range.min}, ${range.max}])`);
}

console.log('\n3. 原型判断:');
const result = classifyArchetype(normalized);
console.log(`  原型: ${result.name} (${result.key})`);
console.log(`  阵营: ${result.alignment}`);
console.log(`  正派%: ${result.heroPct}%, 反派%: ${result.villainPct}%`);

console.log('\n4. 配对检查:');
const pairing = getPairing(result.name);
if (pairing) {
  console.log(`  天作之合: ${pairing.soulmate?.name} (img: ${pairing.soulmate?.img})`);
  console.log(`  宿世之敌: ${pairing.nemesis?.name} (img: ${pairing.nemesis?.img})`);
} else {
  console.log('  未找到配对');
}

console.log('\n5. 头像路径验证:');
const chars = getAllCharacters();
let missingImg = 0;
for (const c of chars) {
  if (!c.img || c.img === '') {
    console.log(`  缺少头像: ${c.name}`);
    missingImg++;
  }
}
console.log(`  总计 ${chars.length} 个角色, ${missingImg} 个缺少头像`);

console.log('\n6. 配对完整性:');
let missingSoulmate = 0, missingNemesis = 0;
for (const [name, p] of Object.entries(require('./src/data/archetypes.js').default || {})) {
  // 这个需要从 archetypes.js 获取 PAIRINGS
}
