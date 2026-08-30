import { describe, expect, it } from 'vitest'
import { heroBanners } from './heroBanners'
import { retroAssets } from './retroAssets'

describe('retroAssets', () => {
  it('defines crest and chrome assets for all hero pages', () => {
    const expectedPages = {
      home: 'home',
      records: 'records',
      seasons: 'seasons',
      playoffs: 'playoffs',
      draft: 'draft',
      trades: 'trades',
      teams: 'teams',
      headToHead: 'headtohead',
      matchups: 'matchups',
      rosters: 'rosters',
    }

    Object.entries(expectedPages).forEach(([key, urlSlug]) => {
      expect(retroAssets[key]).toBeTruthy()
      expect(retroAssets[key].crest.primary).toMatch(new RegExp(`^https://assets\\.valleynatives\\.net/retro/crest-${urlSlug}-primary\\.png$`))
      expect(retroAssets[key].crest.compact).toMatch(new RegExp(`^https://assets\\.valleynatives\\.net/retro/crest-${urlSlug}-compact\\.png$`))
      expect(retroAssets[key].chrome.tickerRail).toMatch(/^https?:\/\//)
      expect(retroAssets[key].chrome.titlePlate).toMatch(/^https?:\/\//)
    })
  })

  it('keeps hero banner asset keys in bijection with retro assets', () => {
    const heroAssetKeys = Object.values(heroBanners).map((banner) => banner.assetKey)
    const retroAssetKeys = Object.keys(retroAssets)

    Object.entries(heroBanners).forEach(([pageKey, banner]) => {
      expect(banner.assetKey).toBeTruthy()
      expect(retroAssets[banner.assetKey]).toBeTruthy()
      expect(banner.assetKey).toBe(pageKey)
    })

    expect(new Set(heroAssetKeys)).toEqual(new Set(retroAssetKeys))
    expect(heroAssetKeys).toHaveLength(retroAssetKeys.length)
  })
})
