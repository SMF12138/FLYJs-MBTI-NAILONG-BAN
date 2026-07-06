const { normalQuestions } = require('./src/data/questions.js');
const { speedQuestions } = require('./src/data/speedQuestions.js');

// 计算正常题+速答题的最大可能得分
const dims = {};
for (const q of [...normalQuestions, ...speedQuestions]) {
  for (const [dim, data] of Object.entries(q.dimensions || {})) {
    if (!dims[dim]) dims[dim] = { max: 0, questions: 0 };
    const vals = Object.values(data).filter(v => typeof v === 'number');
    const w = data.weight || 1;
    dims[dim].max += Math.max(...vals) * w;
    dims[dim].questions++;
  }
}

console.log('正常题+速答题的维度最大分：');
for (const [dim, info] of Object.entries(dims).sort()) {
  console.log(`  ${dim}: max=${info.max.toFixed(1)}, questions=${info.questions}`);
}
