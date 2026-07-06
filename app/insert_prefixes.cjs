// 批量插入 prefix 字段脚本
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/archetypes.js');
let content = fs.readFileSync(filePath, 'utf-8');

const prefixMap = {
  // 特殊高分
  '魅惑者': 'SIREN', '谋断者': 'BLITZ', '光者': 'LUMN',
  '革命者': 'REVLT', '尊者': 'REGAL', '圣母': 'MERCY',
  '赤子': 'INNO', '圣人': 'VIRTU', '无瑕者': 'PURE',
  '勇者': 'BRVE', '不朽者': 'IMRTL', '逍遥者': 'DRFT',
  '贪者': 'COVET', '辩者': 'WITTY', '洞察者': 'PRCE',
  // 特殊低分
  '傻者': 'BLNK', '空心人': 'VOID', '拖延者': 'DLAY',
  '悲者': 'GLOM', '守旧者': 'RUST', '牛马': 'LABR',
  '冷血者': 'CHIL', '疑心病': 'PRNO', '盗跖': 'OUTL',
  '无耻者': 'SHML', '懦夫': 'COWRD', '墙头草': 'SWAY',
  '执念者': 'OBSD', '无欲者': 'EMPTY', '尸体': 'CORPS',
};

for (const [name, prefix] of Object.entries(prefixMap)) {
  // 匹配 format: name: 'XXX', emoji: '...'
  const pattern = new RegExp(`(name: '${name}', emoji: '[^']*', )(verse:)`);
  if (content.includes(`name: '${name}'`) && !content.includes(`prefix: '${prefix}'`)) {
    content = content.replace(pattern, `$1prefix: '${prefix}', $2`);
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done. Inserted prefixes for', Object.keys(prefixMap).length, 'characters.');
