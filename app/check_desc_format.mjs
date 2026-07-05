import { SPECIAL_HIGH } from '../src/data/archetypes.js'
const desc = SPECIAL_HIGH.D1.desc
const lines = desc.trim().split('\n').map(line => line.trim())
for (let i = 0; i < 3; i++) {
  const line = lines[i] || ''
  const first10 = line.substring(0, 10)
  const codes = [...first10].map(c => c.charCodeAt(0))
  console.log(`Line ${i}: "${first10}" -> ${codes.join(',')}`)
}
