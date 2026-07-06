const { normalQuestions } = require('./src/data/questions.js');
const { speedQuestions } = require('./src/data/speedQuestions.js');

// 计算每个维度在一次完整游戏中的理论最大分和最小分
// 包含：正常题+速答+邀请函+1元+彩蛋+超时惩罚+点赞

const dims = {};
for (const [id, _] of Object.entries(require('./src/data/dimensions.js').DIMENSIONS)) {
  dims[id] = { min: 0, max: 0 };
}

// 正常题（所有选项取极值）
for (const q of normalQuestions) {
  for (const [dim, data] of Object.entries(q.dimensions || {})) {
    if (!dims[dim]) dims[dim] = { min: 0, max: 0 };
    const vals = Object.values(data).filter(v => typeof v === 'number');
    const w = data.weight || 1;
    dims[dim].min += Math.min(...vals) * w;
    dims[dim].max += Math.max(...vals) * w;
  }
}

// 速答题
for (const q of speedQuestions) {
  for (const [dim, data] of Object.entries(q.dimensions || {})) {
    if (!dims[dim]) dims[dim] = { min: 0, max: 0 };
    const vals = Object.values(data).filter(v => typeof v === 'number');
    const w = data.weight || 1;
    dims[dim].min += Math.min(...vals) * w;
    dims[dim].max += Math.max(...vals) * w;
  }
}

// 速答超时惩罚（假设最多4题超时）
dims.D1.min += -0.2 * 4;
dims.D3.min += -0.2 * 4;

// 邀请函（取最佳路径：接受）
dims.D2.max += 0.5 * 3; dims.D2.min += -0.3 * 3;
dims.D3.max += 0.5 * 5; dims.D3.min += -0.5 * 5;
dims.D5.max += 0.5 * 2; dims.D5.min += -0.5 * 2;
dims.D8.max += 0.5 * 3; dims.D8.min += -0.3 * 3;
dims.D13.max += 0.5 * 3; dims.D13.min += 0.5 * 3;

// 名字彩蛋
dims.D1.max += 0.8 * 5; dims.D1.min += -0.5 * 4;

// 谜题诗
dims.D1.max += 0.8 * 5;
dims.D5.max += 0.5 * 5;
dims.D12.max += 0.5 * 5;

// 救援彩蛋
dims.D1.max += 0.8 * 4; dims.D1.min += -0.5 * 4;

// 广告彩蛋
dims.D1.max += 0.8 * 4;

// 1元测试（取最佳路径：输入）
dims.D8.max += 0.5 * 4; dims.D8.min += -0.5 * 4;
dims.D14.max += 0.8 * 4; dims.D14.min += -0.3 * 4;
dims.D11.max += 0.5 * 3; dims.D11.min += -0.3 * 2;

// 点赞
dims.D7.max += 1;

console.log('基于一次完整游戏的维度范围：');
for (const [dim, r] of Object.entries(dims).sort()) {
  console.log(`  ${dim}: { min: ${r.min.toFixed(1)}, max: ${r.max.toFixed(1)} },`);
}
