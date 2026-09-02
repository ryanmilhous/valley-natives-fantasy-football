import { describe, expect, it } from 'vitest'
import { heroBanners } from './heroBanners'

describe('heroBanners', () => {
  it('uses the approved repeated-and-unique banner distribution across page heroes', () => {
    const imageUrls = Object.values(heroBanners).map((banner) => banner.imageSrc)
    const counts = imageUrls.reduce((acc, url) => {
      acc[url] = (acc[url] ?? 0) + 1
      return acc
    }, {})

    expect(imageUrls).toHaveLength(10)

    expect(counts['/images/banners/images-4.jpg']).toBe(2)
    expect(counts['/images/banners/images.jpg']).toBe(2)
    expect(counts['/images/banners/images-1.jpg']).toBe(1)
    expect(counts['/images/banners/images-2.jpg']).toBe(1)
    expect(counts['/images/banners/images-3.jpg']).toBe(1)
    expect(counts['/images/banners/Big+Basin+Redwoods.webp']).toBe(1)
    expect(counts['/images/banners/Downtown+Boulder+Creek.webp']).toBe(1)
    expect(counts['/images/banners/Roaring+Camp.webp']).toBe(1)
    expect(Object.keys(counts)).toHaveLength(8)
  })
})
