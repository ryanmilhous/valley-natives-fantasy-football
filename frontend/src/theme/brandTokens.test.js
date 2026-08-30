import { describe, expect, it } from 'vitest'
import { brandTokens } from './brandTokens'

describe('brandTokens color contract', () => {
  it('matches required brand color values', () => {
    expect(brandTokens.colors.bg900).toBe('#0A1310')
    expect(brandTokens.colors.bg800).toBe('#10221B')
    expect(brandTokens.colors.gold500).toBe('#C8A55A')
  })
})
