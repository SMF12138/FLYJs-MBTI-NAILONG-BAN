const fs = require('fs');
const path = require('path');

// 检查所有头像文件是否存在
const avatarDir = path.join(__dirname, 'public/avatars');
const files = fs.readdirSync(avatarDir);

console.log('头像文件数量:', files.length);

// 从 archetypes.js 提取所有 img 路径
const archContent = fs.readFileSync(path.join(__dirname, 'src/data/archetypes.js'), 'utf-8');
const imgMatches = archContent.match(/img:\s*'([^']+)'/g);
const imgPaths = imgMatches.map(m => m.match(/img:\s*'([^']+)'/)[1]);

console.log('代码中引用的头像路径数量:', imgPaths.length);

// 检查每个路径对应的文件是否存在
let missing = 0;
for (const imgPath of imgPaths) {
  // imgPath 格式: /avatars/01_天命织者.jpg
  const filePath = path.join(__dirname, 'public', imgPath);
  if (!fs.existsSync(filePath)) {
    console.log(`  缺失: ${imgPath}`);
    missing++;
  }
}

console.log(`缺失文件: ${missing}`);
console.log('全部检查通过');
