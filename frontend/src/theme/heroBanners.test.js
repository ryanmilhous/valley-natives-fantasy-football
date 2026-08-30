import { describe, expect, it } from 'vitest'
import { heroBanners } from './heroBanners'

describe('heroBanners', () => {
  it('uses 10 distinct valley banner images across page heroes', () => {
    const imageUrls = Object.values(heroBanners).map((banner) => banner.imageSrc)
    const uniqueImages = new Set(imageUrls)

    expect(imageUrls).toHaveLength(10)
    expect(uniqueImages.size).toBe(10)
  })
})

