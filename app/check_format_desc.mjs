import { SPECIAL_HIGH } from '../src/data/archetypes.js'
const desc = SPECIAL_HIGH.D1.desc
const result = desc.trim().split('\n').map(line => line.trim()).filter(Boolean).join('\n')
console.log('Result:')
console.log(JSON.stringify(result.substring(0, 100)))
