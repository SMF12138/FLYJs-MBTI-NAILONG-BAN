const { normalQuestions } = require('./src/data/questions.js');
const { speedQuestions } = require('./src/data/speedQuestions.js');

const ranges = {};

// 正常题（所有选项的极值）
for (const q of normalQuestions) {
  for (const [dim, data] of Object.entries(q.dimensions || {})) {
    if (!ranges[dim]) ranges[dim] = { min: 0, max: 0 };
    const vals = Object.values(data).filter(v => typeof v === 'number');
    const w = data.weight || 1;
    ranges[dim].min += Math.min(...vals) * w;
    ranges[dim].max += Math.max(...vals) * w;
  }
}

// 速答题
for (const q of speedQuestions) {
  for (const [dim, data] of Object.entries(q.dimensions || {})) {
    if (!ranges[dim]) ranges[dim] = { min: 0, max: 0 };
    const vals = Object.values(data).filter(v => typeof v === 'number');
    const w = data.weight || 1;
    ranges[dim].min += Math.min(...vals) * w;
    ranges[dim].max += Math.max(...vals) * w;
  }
}

// 速答超时惩罚（假设最多4题超时，不是全部8题）
ranges.D1 = ranges.D1 || { min: 0, max: 0 };
ranges.D3 = ranges.D3 || { min: 0, max: 0 };
ranges.D1.min += -0.2 * 4;
ranges.D3.min += -0.2 * 4;

// 邀请函（只能走一条路径，取极值路径）
const invPaths = [
  { D3: 2.5, D8: 1.5, D2: 1.5, D13: 1.5, D5: 1.0 },   // 接受
  { D3: -2.5, D8: -0.9, D2: -0.9, D13: 1.5 },           // 拒绝
  { D5: -1.0, D8: -0.9, D2: -0.9, D13: 1.5 },           // 忽略
];
for (const dim of ['D2','D3','D5','D8','D13']) {
  const vals = invPaths.map(p => p[dim] || 0);
  if (!ranges[dim]) ranges[dim] = { min: 0, max: 0 };
  ranges[dim].min += Math.min(...vals);
  ranges[dim].max += Math.max(...vals);
}

// 名字彩蛋（选择题，取极值）
ranges.D1 = ranges.D1 || { min: 0, max: 0 };
ranges.D1.min += -0.5 * 4;  // 起外号
ranges.D1.max += 0.8 * 5;   // 起昵称

// 谜题诗（解谜成功才加分）
ranges.D1 = ranges.D1 || { min: 0, max: 0 };
ranges.D5 = ranges.D5 || { min: 0, max: 0 };
ranges.D12 = ranges.D12 || { min: 0, max: 0 };
ranges.D1.max += 0.8 * 5;
ranges.D5.max += 0.5 * 5;
ranges.D12.max += 0.5 * 5;

// 救援彩蛋（成功/失败）
ranges.D1 = ranges.D1 || { min: 0, max: 0 };
ranges.D1.max += 0.8 * 4;
ranges.D1.min += -0.5 * 4;

// 广告彩蛋
ranges.D1 = ranges.D1 || { min: 0, max: 0 };
ranges.D1.max += 0.8 * 4;

// 1元测试（只能走一条路径，取极值路径）
const yuanPaths = [
  { D3: 4.0, D14: 2.0 },           // 确认
  { D3: -2.5, D14: -2.0, D8: -2.0 }, // 取消
  { D8: 2.0, D14: 3.2, D11: 1.5 },  // 输入
];
for (const dim of ['D3','D8','D11','D14']) {
  const vals = yuanPaths.map(p => p[dim] || 0);
  if (!ranges[dim]) ranges[dim] = { min: 0, max: 0 };
  ranges[dim].min += Math.min(...vals);
  ranges[dim].max += Math.max(...vals);
}

// 点赞
ranges.D7 = ranges.D7 || { min: 0, max: 0 };
ranges.D7.max += 1;

// 输出
for (const [dim, r] of Object.entries(ranges).sort()) {
  console.log(`  ${dim}: { min: ${r.min.toFixed(1)}, max: ${r.max.toFixed(1)} },`);
}
