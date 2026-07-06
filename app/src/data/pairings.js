// ─── 天作之合 & 宿世之敌 ───
// 宿世之敌：正邪对立（同人格的光明面vs黑暗面）
// 天作之合：名称叙事关联，角色主题呼应
const PAIRINGS = {
  // ── 正派16人 ──
  '天命织者':   { soulmate: '末日歌者',     nemesis: '天命收割者' },
  '末日歌者':   { soulmate: '天命织者',     nemesis: '暗潮煽动者' },
  '暗夜守护者': { soulmate: '梦泪拾荒者',   nemesis: '暗夜猎杀者' },
  '梦泪拾荒者': { soulmate: '暗夜守护者',   nemesis: '蚀心者' },
  '龙王':       { soulmate: '奶虫',         nemesis: '屠龙者' },
  '黑幕':       { soulmate: '低语者',       nemesis: '视奸者' },
  '白月光小猫': { soulmate: '心碎梨花猫',   nemesis: '黑化小猫' },
  '心碎梨花猫': { soulmate: '白月光小猫',   nemesis: '嗜血梨花猫' },
  '奶龙':       { soulmate: '创世神',       nemesis: '奶虫' },
  '梦逝者':     { soulmate: '痴儿',         nemesis: '梦魇' },
  '创世神':     { soulmate: '奶龙',         nemesis: '灭世者' },
  '低语者':     { soulmate: '黑幕',         nemesis: '蛊惑者' },
  '花栗鼠大人': { soulmate: '屠龙者',       nemesis: '鼠王' },
  '暮日祈祷者': { soulmate: '鼠王',         nemesis: '暮日审判者' },
  '痴儿':       { soulmate: '梦逝者',       nemesis: '狂者' },
  '孤者':       { soulmate: '死神',         nemesis: '死神' },

  // ── 反派16人 ──
  '天命收割者': { soulmate: '暗夜猎杀者',   nemesis: '天命织者' },
  '暗潮煽动者': { soulmate: '蛊惑者',       nemesis: '末日歌者' },
  '暗夜猎杀者': { soulmate: '天命收割者',   nemesis: '暗夜守护者' },
  '蚀心者':     { soulmate: '梦魇',         nemesis: '梦泪拾荒者' },
  '屠龙者':     { soulmate: '花栗鼠大人',   nemesis: '龙王' },
  '视奸者':     { soulmate: '狂者',         nemesis: '黑幕' },
  '黑化小猫':   { soulmate: '嗜血梨花猫',   nemesis: '白月光小猫' },
  '嗜血梨花猫': { soulmate: '黑化小猫',     nemesis: '心碎梨花猫' },
  '奶虫':       { soulmate: '龙王',         nemesis: '奶龙' },
  '梦魇':       { soulmate: '蚀心者',       nemesis: '梦逝者' },
  '灭世者':     { soulmate: '暮日审判者',   nemesis: '创世神' },
  '蛊惑者':     { soulmate: '暗潮煽动者',   nemesis: '低语者' },
  '鼠王':       { soulmate: '暮日祈祷者',   nemesis: '花栗鼠大人' },
  '暮日审判者': { soulmate: '灭世者',       nemesis: '暮日祈祷者' },
  '狂者':       { soulmate: '视奸者',       nemesis: '痴儿' },
  '死神':       { soulmate: '孤者',         nemesis: '孤者' },
}

export default PAIRINGS
