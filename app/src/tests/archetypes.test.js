import { describe, it, expect } from 'vitest'
import { getAllCharacters, SPECIAL_HIGH, SPECIAL_LOW } from '../data/archetypes.js'

describe('archetypes', () => {
  it('所有匹配角色都有 desc 字段', () => {
    const chars = getAllCharacters()
    for (const char of chars) {
      expect(char.desc, `${char.name} 缺少 desc`).toBeTruthy()
      expect(char.desc.length, `${char.name} desc 过短`).toBeGreaterThan(20)
    }
  })

  it('所有特殊人格都有 desc 字段', () => {
    for (const [dim, trait] of Object.entries(SPECIAL_HIGH)) {
      expect(trait.desc, `高分 ${dim} ${trait.name} 缺少 desc`).toBeTruthy()
      expect(trait.desc.length, `高分 ${dim} ${trait.name} desc 过短`).toBeGreaterThan(20)
    }
    for (const [dim, trait] of Object.entries(SPECIAL_LOW)) {
      expect(trait.desc, `低分 ${dim} ${trait.name} 缺少 desc`).toBeTruthy()
      expect(trait.desc.length, `低分 ${dim} ${trait.name} desc 过短`).toBeGreaterThan(20)
    }
  })
})
