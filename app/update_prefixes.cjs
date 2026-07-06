const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/archetypes.js');
let content = fs.readFileSync(filePath, 'utf-8');

const prefixMap = {
  // 正派
  '天命织者': 'FATE', '末日歌者': 'LAST-SONG', '暗夜守护者': 'TANK-MODE',
  '梦泪拾荒者': 'DREAM-LOOT', '龙王': 'BIG-DRGN', '黑幕': 'PULL-STR',
  '白月光小猫': 'MOON-CAT', '心碎梨花猫': 'CRY-CAT', '奶龙': 'BABY-DRGN',
  '梦逝者': 'DREAM-END', '创世神': 'GENESIS', '低语者': 'PSST...',
  '花栗鼠大人': 'NUT-LORD', '暮日祈祷者': 'LAST-PRAY', '痴儿': 'SIMP',
  '孤者': 'FOREVER-ALONE',
  // 反派
  '天命收割者': 'REAPR', '暗潮煽动者': 'DARK-TIDE', '暗夜猎杀者': 'NIGHT-HUNT',
  '蚀心者': 'ROT-HEART', '屠龙者': 'DRGN-SLAY', '视奸者': 'PEEPER',
  '黑化小猫': 'DARK-CAT', '嗜血梨花猫': 'BLOOD-CAT', '奶虫': 'BUG-LORD',
  '梦魇': 'NIGHTMARE', '灭世者': 'APOCALYPSE', '蛊惑者': 'MIND-TRICK',
  '鼠王': 'RAT-KING', '暮日审判者': 'LAST-JUDGE', '狂者': 'GO-CRAZY',
  '死神': 'GRIM-REAPR',
  // 特殊
  '洞察者': 'ALL-EYES', '傻者': 'NO-BRAIN', '魅惑者': 'RIZZ-LORD',
  '空心人': 'NPC-ONLY', '谋断者': 'BIG-BRAIN', '拖延者': 'DO-LATER',
  '光者': 'FLASH-BANG', '悲者': 'EMO-BOY', '革命者': 'NO-KING',
  '守旧者': 'OLD-BONE', '尊者': 'BIG-BOSS', '牛马': '996-DOG',
  '圣母': 'ANGEL-MOM', '冷血者': 'ICE-VEIN', '赤子': 'BABY-HEART',
  '疑心病': 'SUS-EYES', '圣人': 'HALO-HEAD', '盗跖': 'YOINK-MAN',
  '无瑕者': 'FACTORY-NEW', '无耻者': 'NO-FACE', '勇者': 'NO-FEAR',
  '懦夫': 'RUN-FIRST', '不朽者': 'CANT-DIE', '墙头草': 'BOTH-SIDE',
  '逍遥者': 'YOLO-LIFE', '执念者': 'TRY-HARD', '贪者': 'GIMME-MORE',
  '无欲者': 'BUDDHA-MODE', '辩者': 'WELL-ACTUAL', '尸体': 'SKILL-ISSUE',
};

// 先删除所有旧的 prefix 行
content = content.replace(/\n\s+prefix: '[^']+',/g, '');

// 逐个插入 prefix
for (const [name, prefix] of Object.entries(prefixMap)) {
  // 匹配所有出现该角色名的行
  const escapedPrefix = prefix.replace(/[-\/]/g, '\\$&');
  const regex = new RegExp(`(name: '${name.replace(/[-\/]/g, '\\$&')}', emoji: '[^']*', )(verse:)`);
  content = content.replace(regex, `$1prefix: '${prefix}', $2`);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done. Updated prefixes for', Object.keys(prefixMap).length, 'characters.');
