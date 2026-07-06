const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/archetypes.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 删除所有现有的 prefix 字段
content = content.replace(/, prefix: '[^']*'/g, '');

// 用户指定的完整前缀映射
const prefixMap = {
  // 正派16人
  '天命织者': 'FATE', '末日歌者': 'LAST-SONG', '暗夜守护者': 'TANK-MODE',
  '梦泪拾荒者': 'DREAM-LOOT', '龙王': 'BIG-DRGN', '黑幕': 'PULL-STR',
  '白月光小猫': 'MOON-CAT', '心碎梨花猫': 'CRY-CAT', '奶龙': 'BABY-DRGN',
  '梦逝者': 'DREAM-END', '创世神': 'GENESIS', '低语者': 'PSST...',
  '花栗鼠大人': 'NUT-LORD', '暮日祈祷者': 'LAST-PRAY', '痴儿': 'SIMP',
  '孤者': 'FOREVER-ALONE',
  // 反派16人
  '天命收割者': 'REAPR', '暗潮煽动者': 'DARK-TIDE', '暗夜猎杀者': 'NIGHT-HUNT',
  '蚀心者': 'ROT-HEART', '屠龙者': 'DRGN-SLAY', '视奸者': 'PEEPER',
  '黑化小猫': 'DARK-CAT', '嗜血梨花猫': 'BLOOD-CAT', '奶虫': 'BUG-LORD',
  '梦魇': 'NIGHTMARE', '灭世者': 'APOCALYPSE', '蛊惑者': 'MIND-TRICK',
  '鼠王': 'RAT-KING', '暮日审判者': 'LAST-JUDGE', '狂者': 'GO-CRAZY',
  '死神': 'GRIM-REAPR',
  // 特殊30人
  '洞察者': 'ALL-EYES', '魅惑者': 'RIZZ-LORD', '谋断者': 'BIG-BRAIN',
  '光者': 'FLASH-BANG', '革命者': 'NO-KING', '尊者': 'BIG-BOSS',
  '圣母': 'ANGEL-MOM', '赤子': 'BABY-HEART', '圣人': 'HALO-HEAD',
  '无瑕者': 'FACTORY-NEW', '勇者': 'NO-FEAR', '不朽者': 'CANT-DIE',
  '逍遥者': 'YOLO-LIFE', '贪者': 'GIMME-MORE', '辩者': 'WELL-ACTUAL',
  '傻者': 'NO-BRAIN', '空心人': 'NPC-ONLY', '拖延者': 'DO-LATER',
  '悲者': 'EMO-BOY', '守旧者': 'OLD-BONE', '牛马': '996-DOG',
  '冷血者': 'ICE-VEIN', '疑心病': 'SUS-EYES', '盗跖': 'YOINK-MAN',
  '无耻者': 'NO-FACE', '懦夫': 'RUN-FIRST', '墙头草': 'BOTH-SIDE',
  '执念者': 'TRY-HARD', '无欲者': 'BUDDHA-MODE', '尸体': 'SKILL-ISSUE',
};

for (const [name, prefix] of Object.entries(prefixMap)) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 匹配: name: 'xxx', emoji: '...', 然后在 verse: 前插入 prefix
  // 基础角色格式: name: 'xxx', emoji: '...', img: '...', verse: '...'
  // 特殊角色格式: name: 'xxx', emoji: '...', verse: '...'
  const regex = new RegExp(`(name: '${escapedName}', emoji: '[^']*', )(?:img: '[^']*', )?(verse:)`);
  content = content.replace(regex, `$1prefix: '${prefix}', $2`);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done. Updated prefixes for', Object.keys(prefixMap).length, 'characters.');
