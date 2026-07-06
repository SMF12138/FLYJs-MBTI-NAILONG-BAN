const { normalQuestions } = require('./src/data/questions.js');
const { speedQuestions } = require('./src/data/speedQuestions.js');
const { DIMENSION_RANGES } = require('./src/data/dimensionRanges.js');

const SIMS = 10000;
const dimIds = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15'];
const sums = {};
const mins = {};
const maxs = {};
for (const id of dimIds) { sums[id] = 0; mins[id] = Infinity; maxs[id] = -Infinity; }

for (let s = 0; s < SIMS; s++) {
  const raw = {};
  for (const id of dimIds) raw[id] = 0;

  // 正常题：随机选选项
  for (const q of normalQuestions) {
    const opts = Object.keys(q.dimensions || {}).length > 0 ? q.options : [];
    if (opts.length === 0) continue;
    const chosen = opts[Math.floor(Math.random() * opts.length)];
    for (const [dim, data] of Object.entries(q.dimensions || {})) {
      const w = data.weight || 1;
      raw[dim] += (data[chosen.id] || 0) * w;
    }
  }

  // 速答：随机选
  for (const q of speedQuestions) {
    if (Math.random() < 0.15) continue; // 15%概率超时
    const chosen = q.options[Math.floor(Math.random() * q.options.length)];
    for (const [dim, data] of Object.entries(q.dimensions || {})) {
      const w = data.weight || 1;
      raw[dim] += (data[chosen.id] || 0) * w;
    }
  }

  // 邀请函：随机一条路径
  const invPath = Math.random();
  if (invPath < 0.4) { // 接受
    raw.D3 += 0.5*5; raw.D2 += 0.5*3; raw.D8 += 0.5*3; raw.D13 += 0.5*3; raw.D5 += 0.5*2;
  } else if (invPath < 0.7) { // 拒绝
    raw.D3 += -0.5*5; raw.D8 += -0.3*3; raw.D2 += -0.3*3; raw.D13 += 0.5*3;
  } else { // 忽略
    raw.D5 += -0.5*2; raw.D8 += -0.3*3; raw.D2 += -0.3*3; raw.D13 += 0.5*3;
  }

  // 1元：随机一条路径
  const yuanPath = Math.random();
  if (yuanPath < 0.4) { // 确认
    raw.D3 += 0.8*5; raw.D14 += 0.5*4;
  } else if (yuanPath < 0.7) { // 取消
    raw.D3 += -0.5*5; raw.D14 += -0.5*4; raw.D8 += -0.5*4;
  } else { // 输入
    raw.D8 += 0.5*4; raw.D14 += 0.8*4; raw.D11 += 0.5*3;
  }

  // 归一化并统计
  for (const dim of dimIds) {
    const range = DIMENSION_RANGES[dim];
    const norm = ((raw[dim] - range.min) / (range.max - range.min)) * 100;
    const clamped = Math.max(0, Math.min(100, Math.round(norm)));
    sums[dim] += clamped;
    if (clamped < mins[dim]) mins[dim] = clamped;
    if (clamped > maxs[dim]) maxs[dim] = clamped;
  }
}

console.log(`${SIMS}次随机模拟结果：`);
console.log(`${'维度'.padEnd(5)} ${'平均'.padStart(6)} ${'最小'.padStart(6)} ${'最大'.padStart(6)} ${'区间'.padStart(12)}`);
for (const dim of dimIds) {
  const avg = Math.round(sums[dim] / SIMS);
  const min = mins[dim];
  const max = maxs[dim];
  let zone = '';
  if (avg < 30) zone = '偏低';
  else if (avg < 50) zone = '中低';
  else if (avg < 70) zone = '适中 ✓';
  else if (avg < 90) zone = '偏高';
  else zone = '过高';
  console.log(`${dim.padEnd(5)} ${String(avg).padStart(6)} ${String(min).padStart(6)} ${String(max).padStart(6)} ${zone.padStart(12)}`);
}
