import { describe, expect, it } from 'vitest'
import { retroAssets } from './retroAssets'

describe('retroAssets', () => {
  it('defines crest and chrome assets for all hero pages', () => {
    const expectedPages = [
      'home', 'records', 'seasons', 'playoffs', 'draft',
      'trades', 'teams', 'headToHead', 'matchups', 'rosters',
    ]

    expectedPages.forEach((key) => {
      expect(retroAssets[key]).toBeTruthy()
      expect(retroAssets[key].crest.primary).toMatch(/^https?:\/\//)
      expect(retroAssets[key].chrome.tickerRail).toMatch(/^https?:\/\//)
      expect(retroAssets[key].chrome.titlePlate).toMatch(/^https?:\/\//)
    })
  })
})
