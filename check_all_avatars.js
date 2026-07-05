const fs = require('fs');
const path = require('path');
const avatarDir = path.resolve('D:\\\\风不死\\\\编码\\\\Code\\\\Mimo\\\\MBTI-Character-Test\\\\app\\\\public\\\\avatars');
const avatarFiles = new Set(fs.readdirSync(avatarDir));

const arch = fs.readFileSync('D:\\\\风不死\\\\编码\\\\Code\\\\Mimo\\\\MBTI-Character-Test\\\\app\\\\src\\\\data\\\\archetypes.js', 'utf8');

// Extract BASE block
const baseStart = arch.indexOf('const BASE = {');
let brace = 0, inStr = false, strChar = '';
let baseEnd = baseStart;
for (let i = baseStart; i < arch.length; i++) {
  const c = arch[i];
  if (inStr) { if (c === '\\\\' && arch[i+1] === strChar) i++; else if (c === strChar) inStr = false; }
  else if (c === '"' || c === "'") { inStr = true; strChar = c; }
  else if (c === '{') brace++;
  else if (c === '}') { brace--; if (brace === 0) { baseEnd = i; break; } }
}
const baseSection = arch.substring(baseStart, baseEnd + 1);

// Extract VILLAIN_MAP block
const vilStart = arch.indexOf('const VILLAIN_MAP = {');
brace = 0; inStr = false; strChar = '';
let vilEnd = vilStart;
for (let i = vilStart; i < arch.length; i++) {
  const c = arch[i];
  if (inStr) { if (c === '\\\\' && arch[i+1] === strChar) i++; else if (c === strChar) inStr = false; }
  else if (c === '"' || c === "'") { inStr = true; strChar = c; }
  else if (c === '{') brace++;
  else if (c === '}') { brace--; if (brace === 0) { vilEnd = i; break; } }
}
const vilSection = arch.substring(vilStart, vilEnd + 1);

const baseNames = [];
let m;
const nameRegex = /name:\s*['"]([\u4e00-\u9fff]+)['"]/g;
while ((m = nameRegex.exec(baseSection)) !== null) baseNames.push(m[1]);
const baseImgs = [];
const imgRegex = /img:\s*['"]([^'"]+)['"]/g;
while ((m = imgRegex.exec(baseSection)) !== null) baseImgs.push(m[1]);

const vilNames = [];
const vilNameRegex = /name:\s*['"]([\u4e00-\u9fff]+)['"]/g;
while ((m = vilNameRegex.exec(vilSection)) !== null) vilNames.push(m[1]);
const vilImgs = [];
const vilImgRegex = /img:\s*['"]([^'"]+)['"]/g;
while ((m = vilImgRegex.exec(vilSection)) !== null) vilImgs.push(m[1]);

// Extract special lists
const specHigh = [];
const highRegex = /D\d+:\s*\{\s*name:\s*['"]([^'"]+)['"]/g;
const highStart = arch.indexOf('const SPECIAL_HIGH = {');
const highEnd = arch.indexOf('}', highStart);
while ((m = highRegex.exec(arch.substring(highStart, highEnd))) !== null) specHigh.push(m[1]);

const specLow = [];
const lowStart = arch.indexOf('const SPECIAL_LOW = {');
const lowEnd = arch.indexOf('}', lowStart);
while ((m = highRegex.exec(arch.substring(lowStart, lowEnd))) !== null) specLow.push(m[1]);

const specialList = [...specHigh, ...specLow];

console.log('BASE count:', baseNames.length, 'imgs:', baseImgs.length);
console.log('VILLAIN count:', vilNames.length, 'imgs:', vilImgs.length);
console.log('Special count:', specialList.length);

let missing = 0;
[...baseImgs, ...vilImgs].forEach(img => {
  const fileName = path.basename(img);
  if (!avatarFiles.has(fileName)) { console.log('MISSING base/villain:', img); missing++; }
});

specialList.forEach((name, i) => {
  const num = String(33 + i).padStart(2, '0');
  // Determine extension by checking existing files
  const jpg = num + '_' + name + '.jpg';
  const png = num + '_' + name + '.png';
  if (!avatarFiles.has(jpg) && !avatarFiles.has(png)) {
    console.log('MISSING special:', num + '_' + name + '.(jpg|png)');
    missing++;
  }
});

console.log('Total missing:', missing);
