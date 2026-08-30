import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageHero from './PageHero'

describe('PageHero', () => {
  it('renders optional heading content and actions', () => {
    const { container } = render(
      <PageHero
        eyebrow="League History"
        title="Head-to-Head"
        subtitle="Compare records across seasons"
        actions={<button type="button">Export</button>}
      />,
    )

    expect(screen.getByText('League History')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Head-to-Head' })).toBeInTheDocument()
    expect(screen.getByText('Compare records across seasons')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(container.querySelector('.vn-page-hero')).toBeTruthy()
  })

  it('renders body content and custom class names', () => {
    const { container } = render(
      <PageHero className="u-stack-md">
        <p>Secondary content</p>
      </PageHero>,
    )

    expect(screen.getByText('Secondary content')).toBeInTheDocument()
    expect(container.querySelector('.vn-page-hero.u-stack-md')).toBeTruthy()
    expect(container.querySelector('.vn-page-hero__body')).toBeTruthy()
  })
})

describe('PageHero retro slots', () => {
  it('renders ticker rail and title plate decorative assets with expected attributes', () => {
    const tickerRailSrc = 'https://assets.valleynatives.net/retro/ticker-records.png'
    const titlePlateSrc = 'https://assets.valleynatives.net/retro/title-plate-records.png'

    const { container } = render(
      <PageHero title="League Records" tickerRailSrc={tickerRailSrc} titlePlateSrc={titlePlateSrc} />,
    )

    const tickerRail = container.querySelector('.vn-page-hero__ticker-rail')
    const titlePlate = container.querySelector('.vn-page-hero__title-plate')

    expect(tickerRail).toBeTruthy()
    expect(tickerRail).toHaveAttribute('src', tickerRailSrc)
    expect(tickerRail).toHaveAttribute('alt', '')
    expect(tickerRail).toHaveAttribute('aria-hidden', 'true')
    expect(titlePlate).toBeTruthy()
    expect(titlePlate).toHaveAttribute('src', titlePlateSrc)
    expect(titlePlate).toHaveAttribute('alt', '')
    expect(titlePlate).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders optional crest asset with expected image attributes', () => {
    const crestSrc = 'https://assets.valleynatives.net/retro/crest-records-primary.png'

    const { container } = render(
      <PageHero
        title="League Records"
        imageSrc="https://upload.wikimedia.org/example.jpg"
        crestSrc={crestSrc}
      />,
    )

    const crest = container.querySelector('.vn-page-hero__crest')
    expect(crest).toBeTruthy()
    expect(crest).toHaveAttribute('src', crestSrc)
    expect(crest).toHaveAttribute('alt', '')
    expect(crest).toHaveAttribute('loading', 'lazy')
    expect(crest).toHaveAttribute('decoding', 'async')
  })

  it('does not render retro chrome slots when corresponding props are absent', () => {
    const { container } = render(<PageHero title="League Records" />)

    expect(container.querySelector('.vn-page-hero__ticker-rail')).toBeNull()
    expect(container.querySelector('.vn-page-hero__title-plate')).toBeNull()
    expect(container.querySelector('.vn-page-hero__crest')).toBeNull()
  })
})
