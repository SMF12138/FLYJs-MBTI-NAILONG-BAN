const fs = require('fs');
const content = fs.readFileSync('src/data/pairings.js', 'utf8');

// Remove comments
const clean = content.replace(/\/\/.*$/gm, '');

// Extract object between first { and last }
const start = clean.indexOf('{');
const end = clean.lastIndexOf('}');
const objStr = clean.slice(start, end + 1);

// Convert to valid JSON
const jsonStr = objStr
  .replace(/(\w+)\s*:/g, '"$1":')
  .replace(/'/g, '"');

try {
  const PAIRINGS = JSON.parse(jsonStr);
  const sm = {};
  const nm = {};
  
  for (const [k, v] of Object.entries(PAIRINGS)) {
    sm[v.soulmate] = (sm[v.soulmate] || 0) + 1;
    nm[v.nemesis] = (nm[v.nemesis] || 0) + 1;
  }
  
  const smDups = Object.entries(sm).filter(([k, v]) => v > 1);
  const nmDups = Object.entries(nm).filter(([k, v]) => v > 1);
  
  console.log('Soulmate duplicates:', smDups.length ? smDups : 'NONE');
  console.log('Nemesis duplicates:', nmDups.length ? nmDups : 'NONE');
  console.log('Total keys:', Object.keys(PAIRINGS).length);
} catch (e) {
  console.error('Parse error:', e.message);
}
