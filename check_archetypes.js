const fs = require('fs');
const path = require('path');
const arch = fs.readFileSync('D:\\\\风不死\\\\编码\\\\Code\\\\Mimo\\\\MBTI-Character-Test\\\\app\\\\src\\\\data\\\\archetypes.js', 'utf8');

function extractBlock(startToken) {
  const start = arch.indexOf(startToken);
  if (start < 0) return '';
  let braceDepth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;
  for (let i = start; i < arch.length; i++) {
    const c = arch[i];
    if (escaped) { escaped = false; continue; }
    if (inString) {
      if (c === '\\\\') escaped = true;
      else if (c === stringChar) inString = false;
    } else {
      if (c === '"' || c === "'") { inString = true; stringChar = c; }
      else if (c === '{') braceDepth++;
      else if (c === '}') { braceDepth--; if (braceDepth === 0) return arch.substring(start, i + 1); }
    }
  }
  return arch.substring(start);
}

const baseSection = extractBlock('BASE = {');
const villainSection = extractBlock('VILLAIN_MAP = {');

const baseKeys = [];
const keyRegex = /['"]([ie][cr][Ss][Bb])['"]\s*:\s*\{/g;
let m;
while ((m = keyRegex.exec(baseSection)) !== null) baseKeys.push(m[1]);

const baseNames = [];
const nameRegex = /name:\s*['"]([\u4e00-\u9fff]+)['"]/g;
let nm;
while ((nm = nameRegex.exec(baseSection)) !== null) baseNames.push(nm[1]);

const villainKeys = [];
const vRegex = /['"]([\u4e00-\u9fff]+)['"]\s*:/g;
let vm;
while ((vm = vRegex.exec(villainSection)) !== null) villainKeys.push(vm[1]);

console.log('BASE keys:', baseKeys.length);
console.log('BASE names:', baseNames.length);
console.log('VILLAIN_MAP keys:', villainKeys.length);

let ok = true;
if (baseNames.length !== 16) { console.log('ERROR: BASE names count not 16'); ok = false; }
if (villainKeys.length !== 16) { console.log('ERROR: VILLAIN_MAP keys count not 16'); ok = false; }
baseNames.forEach(name => {
  if (!villainKeys.includes(name)) { console.log('MISSING VILLAIN_MAP:', name); ok = false; }
});

if (ok) console.log('ALL CHECKS PASSED');

// Check all BASE keys have files
const avatarDir = 'D:\\\\风不死\\\\编码\\\\Code\\\\Mimo\\\\MBTI-Character-Test\\\\app\\\\public\\\\avatars';
const avatarFiles = new Set(fs.readdirSync(avatarDir));
const imgRegex = /img:\s*['"]([^'"]+)['"]/g;
let img;
let imgCount = 0;
while ((img = imgRegex.exec(baseSection)) !== null) {
  imgCount++;
  const fileName = path.basename(img[1]);
  if (!avatarFiles.has(fileName)) { console.log('BASE MISSING AVATAR:', img[1]); ok = false; }
}
while ((img = imgRegex.exec(villainSection)) !== null) {
  imgCount++;
  const fileName = path.basename(img[1]);
  if (!avatarFiles.has(fileName)) { console.log('VILLAIN MISSING AVATAR:', img[1]); ok = false; }
}
console.log('Images checked:', imgCount);
