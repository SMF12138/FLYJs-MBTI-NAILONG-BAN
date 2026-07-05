const fs = require('fs');
const path = require('path');
const base = 'D:\\风不死\\编码\\Code\\Mimo\\MBTI-Character-Test\\app\\src';

// Check all .vue files for broken imports
const componentsDir = path.join(base, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.vue'));
files.forEach(f => {
  const content = fs.readFileSync(path.join(componentsDir, f), 'utf8');
  const imports = content.match(/import .+ from ['"](.+)['"]/g) || [];
  imports.forEach(imp => {
    const match = imp.match(/from ['"](.+)['"]/);
    if (match && match[1].startsWith('.')) {
      const resolved = path.resolve(path.dirname(path.join(componentsDir, f)), match[1]);
      const exists = fs.existsSync(resolved) || 
        fs.existsSync(resolved + '.vue') || 
        fs.existsSync(resolved + '.js') || 
        fs.existsSync(resolved + '.ts') ||
        fs.existsSync(resolved + '/index.js');
      if (!exists) console.log('BROKEN: ' + f + ' -> ' + match[1]);
    }
  });
});

// Check archetypes.js BASE keys
const archContent = fs.readFileSync(path.join(base, 'data', 'archetypes.js'), 'utf8');
const baseKeysMatch = archContent.match(/BASE\s*=\s*\{/);
if (baseKeysMatch) {
  // Find all keys in BASE
  const baseSection = archContent.substring(archContent.indexOf('BASE = {'));
  const keys = [];
  const keyRegex = /['"]([a-z][A-Za-z]+)['"]\s*:/g;
  let m;
  let count = 0;
  while ((m = keyRegex.exec(baseSection)) !== null) {
    keys.push(m[1]);
    count++;
    if (count > 30) break;
  }
  console.log('BASE keys found:', keys.length, keys);
  
  // Find all keys in VILLAIN_MAP
  const villainSection = archContent.substring(archContent.indexOf('VILLAIN_MAP'));
  const villainKeys = [];
  const vkRegex = /['"]([\u4e00-\u9fff]+)['"]\s*:/g;
  let vm;
  let vcount = 0;
  while ((vm = vkRegex.exec(villainSection)) !== null) {
    villainKeys.push(vm[1]);
    vcount++;
    if (vcount > 30) break;
  }
  console.log('VILLAIN_MAP keys:', villainKeys.length, villainKeys);
  
  // Check which BASE names are NOT in VILLAIN_MAP
  const baseNames = [];
  const bnRegex = /name:\s*['"]([\u4e00-\u9fff]+)['"]/g;
  let bn;
  let bnCount = 0;
  const baseStart = archContent.indexOf('BASE = {');
  const baseEnd = archContent.indexOf('};', baseStart);
  while ((bn = bnRegex.exec(archContent.substring(baseStart, baseEnd))) !== null) {
    baseNames.push(bn[1]);
    bnCount++;
    if (bnCount > 20) break;
  }
  console.log('BASE names:', baseNames);
  baseNames.forEach(name => {
    if (!villainKeys.includes(name)) {
      console.log('MISSING from VILLAIN_MAP: ' + name);
    }
  });
}

// Check classifyArchetype return for baseName
const classifyMatch = archContent.match(/return\s*\{[\s\S]*?baseName:\s*base\.name/);
if (classifyMatch) {
  console.log('classifyArchetype returns baseName: base.name - OK');
}

console.log('\nDone.');
